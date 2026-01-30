import { NextRequest, NextResponse } from 'next/server';
import { ImagenService } from '@/lib/services/imagen-service';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.prompt || !body.platform) {
      return NextResponse.json(
        { error: 'Missing required fields: prompt, platform' },
        { status: 400 }
      );
    }

    console.log(`🎨 Image Generation Request for ${body.platform}`);

    const imagenService = new ImagenService();

    const result = await imagenService.generateImage({
      prompt: body.prompt,
      platform: body.platform,
      aspectRatio: body.aspectRatio,
      numberOfImages: body.numberOfImages || 1,
      style: body.style || 'realistic',
      negativePrompt: body.negativePrompt,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Image generation failed' },
        { status: 500 }
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
      metadata: {
        ...result.metadata,
        totalTimeMs: totalTime,
      },
    });
  } catch (error) {
    console.error('❌ Image generation error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const imagenService = new ImagenService();
    const health = await imagenService.healthCheck();

    return NextResponse.json({
      service: 'Imagen 4.0 Ultra',
      ...health,
    });
  } catch (error) {
    return NextResponse.json(
      {
        service: 'Imagen 4.0 Ultra',
        configured: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
