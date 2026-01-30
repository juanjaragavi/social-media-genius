import { NextRequest, NextResponse } from 'next/server';
import { validatePost } from '@/lib/social-validators';

interface ValidateRequest {
  platform: string;
  content: string;
  hashtags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();

    // Validate required fields
    if (!body.platform || typeof body.content !== 'string') {
      return NextResponse.json(
        { error: 'Missing required fields: platform, content' },
        { status: 400 }
      );
    }

    // Perform validation
    const result = validatePost(
      body.platform,
      body.content,
      body.hashtags || []
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error validating content:', error);
    return NextResponse.json(
      {
        error: 'Failed to validate content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
