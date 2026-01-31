import { NextRequest, NextResponse } from "next/server";
import { VeoService } from "@/lib/services/veo-service";

export async function POST(request: NextRequest) {
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

    console.log(`🎬 Video Generation Request for ${body.platform}`);

    const veoService = new VeoService();

    const result = await veoService.generateVideo({
      prompt: body.prompt,
      platform: body.platform,
      durationSeconds: body.durationSeconds,
      aspectRatio: body.aspectRatio,
      style: body.style || "dynamic",
      negativePrompt: body.negativePrompt,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || "Video generation failed",
          available: false,
          message:
            "Veo 3.1 is currently in preview. Check back soon for full video generation support.",
        },
        { status: 503 },
      );
    }

    const totalTime = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      video: {
        videoUrl: result.videoUrl,
        base64: result.base64,
        mimeType: result.mimeType,
      },
      metadata: {
        ...result.metadata,
        totalTimeMs: totalTime,
      },
    });
  } catch (error) {
    console.error("❌ Video generation error:", error);

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
    const veoService = new VeoService();
    const health = await veoService.healthCheck();

    return NextResponse.json({
      service: "Veo 3.1 Fast Generate",
      ...health,
      note: health.available
        ? "Video generation is available"
        : "Video generation is in preview - API access may be limited",
    });
  } catch (error) {
    return NextResponse.json(
      {
        service: "Veo 3.1 Fast Generate",
        configured: false,
        available: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
