import { NextRequest, NextResponse } from "next/server";
import { ImagenService } from "@/lib/services/imagen-service";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  // ── Auth Gate ──────────────────────────────────────────
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  // ──────────────────────────────────────────────────────────

  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.prompt || !body.platform) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, platform" },
        { status: 400 },
      );
    }

    const bannerWidth = body.bannerWidth;
    const bannerHeight = body.bannerHeight;
    const bannerAspectRatio = body.bannerAspectRatio || body.aspectRatio;

    console.log(
      `🎨 Banner Image Generation for ${body.platform}${bannerWidth ? ` (${bannerWidth}×${bannerHeight})` : ""}`,
    );

    const imagenService = new ImagenService();

    // Enhance prompt for photorealistic banner output
    const enhancedPrompt = body.prompt.includes("photorealistic")
      ? body.prompt
      : `${body.prompt}. Photorealistic, 8K resolution, hyper-detailed, professional photography, studio quality`;

    const result = await imagenService.generateImage({
      prompt: enhancedPrompt,
      platform: body.platform,
      aspectRatio: bannerAspectRatio,
      numberOfImages: body.numberOfImages || 1,
      style: body.style || "realistic",
      negativePrompt:
        body.negativePrompt ||
        "text, watermark, logo, letters, words, typography, low quality, blurry, pixelated",
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Image generation failed" },
        { status: 500 },
      );
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      image: {
        dataUrl: result.dataUrl,
        base64: result.base64,
        mimeType: result.mimeType,
      },
      banner: {
        width: bannerWidth,
        height: bannerHeight,
        aspectRatio: bannerAspectRatio,
      },
      metadata: {
        ...result.metadata,
        totalTimeMs: totalTime,
      },
    });
  } catch (error) {
    console.error("❌ Image generation error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const imagenService = new ImagenService();
    const health = await imagenService.healthCheck();

    return NextResponse.json({
      service: "Imagen 4.0 Ultra",
      ...health,
    });
  } catch (error) {
    return NextResponse.json(
      {
        service: "Imagen 4.0 Ultra",
        configured: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
