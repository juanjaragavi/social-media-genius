import { NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google-client";
import { requireAuth } from "@/lib/auth-guard";

/**
 * AI Image Editor API Route
 *
 * Accepts a base64 image and a text prompt describing desired edits.
 * Uses Gemini to generate an editing prompt, then uses Imagen to generate
 * a new version of the image based on the edit instructions.
 */
export async function POST(request: NextRequest) {
  // ── Auth Gate ──────────────────────────────────────────
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  // ──────────────────────────────────────────────────────────

  const startTime = Date.now();

  try {
    const body = await request.json();

    if (!body.prompt) {
      return NextResponse.json(
        { error: "Missing required field: prompt" },
        { status: 400 },
      );
    }

    console.log(`🎨 AI Edit Request: "${body.prompt}"`);

    const client = getGoogleClient();

    // Use Gemini to transform the edit instruction into an Imagen-ready prompt
    const editPromptResult = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert image prompt engineer. The user wants to edit an existing social media banner image.

User's edit instruction: "${body.prompt}"

Generate a detailed, photorealistic image generation prompt that incorporates the user's desired changes. The prompt should:
1. Be suitable for Imagen 4.0 image generation
2. Maintain the original composition/layout concept
3. Apply the specific edits the user requested
4. Be photorealistic and high quality
5. Be a single paragraph, no more than 200 words

Respond with ONLY the image prompt, nothing else.`,
            },
          ],
        },
      ],
    });

    const editedPrompt = editPromptResult.text?.trim() || body.prompt;

    console.log(
      `✏️ Generated edit prompt: ${editedPrompt.substring(0, 100)}...`,
    );

    // Now generate a new image with the edited prompt using Imagen
    const { ImagenService } = await import("@/lib/services/imagen-service");
    const imagenService = new ImagenService();

    const result = await imagenService.generateImage({
      prompt: editedPrompt,
      platform: body.platform || "instagram",
      aspectRatio: body.aspectRatio,
      style: "realistic",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "AI edit failed" },
        { status: 500 },
      );
    }

    const totalTime = Date.now() - startTime;

    console.log(`✅ AI Edit completed in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      image: {
        dataUrl: result.dataUrl,
        base64: result.base64,
        mimeType: result.mimeType,
      },
      editPrompt: editedPrompt,
      metadata: {
        ...result.metadata,
        totalTimeMs: totalTime,
      },
    });
  } catch (error) {
    console.error("❌ AI Edit error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
