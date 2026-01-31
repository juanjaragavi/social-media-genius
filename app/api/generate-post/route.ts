import { NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google-client";
import { getPlatformSpec } from "@/lib/social-platform-specs";
import type {
  GeneratePostRequest,
  GeneratePostResponse,
} from "@/types/social-platforms";

// System prompt for social media post generation
const getSystemPrompt = (platform: string) => {
  const platformSpec = getPlatformSpec(platform);
  if (!platformSpec) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  const platformGuidelines = {
    instagram: `
**Instagram Strategy**:
- Visual-first platform: Content should complement stunning imagery
- Casual, authentic tone with strategic emoji use
- Storytelling approach: Hook in first 125 characters (before "more" button)
- Hashtags: 3-5 highly relevant tags (2026 limit is 5 max)
- Community engagement: Ask questions, encourage saves/shares
- Call-to-action: Natural, not pushy (e.g., "Link in bio", "DM us", "Save for later")
`,
    twitter: `
**Twitter/X Strategy**:
- Concise, punchy, immediate value
- News-worthy angle or hot take
- 1-2 hashtags maximum for better engagement
- Thread-aware: Can suggest follow-up tweets
- Conversational tone, personality-driven
- Call-to-action: Clear and direct (reply, retweet, click link)
`,
    facebook: `
**Facebook Strategy**:
- Conversational, community-focused
- Storytelling with personal touch
- Longer form accepted but keep key message in first 2-3 lines
- 1-2 hashtags (engagement drops with 3-5)
- Questions and polls perform well
- Call-to-action: Encourage comments and shares
`,
    tiktok: `
**TikTok Strategy**:
- Video-first: Caption supports the video content
- Trending language, Gen-Z friendly
- Hook immediately with intrigue or value
- 3+ hashtags, mix of trending and niche
- Challenges, duets, and trends integration
- Call-to-action: "Watch till the end", "Try this", "Duet this"
`,
    linkedin: `
**LinkedIn Strategy**:
- Professional, thought-leadership tone
- Industry insights, business value
- Data-driven or experience-based
- 3-5 industry-specific hashtags
- Longer posts accepted (1000-1500 chars optimal)
- Call-to-action: Professional engagement (comment insights, share experience)
`,
  };

  return `# System Prompt - Social Media Post Generation for ${platformSpec.name}

You are an expert social media content strategist specializing in creating platform-optimized posts that drive engagement.

## Core Mission
Generate compelling, platform-specific social media content that:
1. Respects platform character limits and constraints
2. Matches the platform's cultural norms and user expectations
3. Drives measurable engagement (likes, shares, comments, saves)
4. Includes optimal media generation prompts when requested

${platformGuidelines[platform as keyof typeof platformGuidelines] || ""}

## Platform Specifications for ${platformSpec.name}
- **Character Limit**: ${platformSpec.text.maxChars}${platformSpec.text.sweetSpot ? ` (optimal: ${platformSpec.text.sweetSpot} chars)` : ""}
- **Hashtag Limit**: ${platformSpec.hashtags.max} (recommended: ${platformSpec.hashtags.recommended})
- **Image Formats**: ${platformSpec.images.formats.join(", ")}
- **Video Formats**: ${platformSpec.videos.formats.join(", ")}

## Content Structure Guidelines

### Hook (First Line/Sentence)
- Grab attention immediately
- Use curiosity, emotion, or value proposition
- Platform-specific: ${platform === "instagram" ? "Visual descriptor or emotion" : platform === "twitter" ? "Hot take or news angle" : platform === "tiktok" ? "Trending phrase or challenge" : platform === "linkedin" ? "Professional insight" : "Engaging question"}

### Body (Main Content)
- Clear, scannable, valuable
- Use line breaks for readability
- ${platform === "instagram" ? "Tell a story, be authentic" : platform === "twitter" ? "Get to the point fast" : platform === "tiktok" ? "Support the video narrative" : platform === "linkedin" ? "Provide depth and expertise" : "Conversational and relatable"}
- Include relevant emojis naturally (not forced)

### Call-to-Action
- Natural, not salesy
- Platform-appropriate: ${platform === "instagram" ? '"Link in bio", "Save this", "DM us"' : platform === "twitter" ? '"Reply with...", "RT if..."' : platform === "tiktok" ? '"Try this", "Duet me"' : platform === "linkedin" ? '"Share your thoughts", "Connect with me"' : '"Comment below", "Tag a friend"'}

### Hashtags
- ${platformSpec.hashtags.recommended} recommended (max ${platformSpec.hashtags.max})
- Mix of:
  - Broad reach hashtags (high volume)
  - Niche hashtags (targeted audience)
  - Branded/campaign hashtags (if applicable)
- Placement: ${platform === "instagram" || platform === "tiktok" ? "In caption or first comment" : "Integrated naturally in text"}

## Media Generation Prompts

### Image Prompt Guidelines
When generating image prompts:
- Platform-optimal dimensions: ${platformSpec.images.dimensions.map((d) => `${d.name} (${d.aspectRatio})`).join(", ")}
- Style should match post tone and platform aesthetic
- Consider trending visual styles on the platform
- Avoid text overlays (unless explicitly requested)
- Optimize for mobile viewing

### Video Prompt Guidelines
When generating video prompts:
- Duration: ${platform === "instagram" ? "15-60 seconds for Reels" : platform === "twitter" ? "15-45 seconds" : platform === "tiktok" ? "15-60 seconds" : platform === "linkedin" ? "30-90 seconds" : "30-90 seconds"}
- Aspect ratio: ${platformSpec.videos.dimensions[0]?.aspectRatio || "16:9 or 9:16"}
- Hook in first 3 seconds
- Fast-paced, dynamic
- Platform trends: ${platform === "tiktok" ? "Trending sounds, effects, transitions" : platform === "instagram" ? "Reels trends, trending audio" : "Professional, polished"}

## Output Format

You MUST respond with valid JSON in this exact format:

\`\`\`json
{
  "content": "The main post text content",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "imagePrompt": "Detailed prompt for image generation (if requested)",
  "videoPrompt": "Detailed prompt for video generation (if requested)",
  "metadata": {
    "estimatedEngagement": "high|medium|low",
    "contentType": "educational|entertaining|promotional|inspirational",
    "targetAudience": "Brief audience description"
  }
}
\`\`\`

## CRITICAL RULES
1. **Character Limit**: Never exceed ${platformSpec.text.maxChars} characters
2. **Hashtag Limit**: Never exceed ${platformSpec.hashtags.max} hashtags
3. **Authenticity**: Sound human, not corporate or robotic
4. **Platform Culture**: Match the platform's vibe and norms
5. **Value First**: Every post must provide value (educate, entertain, inspire, inform)
6. **Mobile-First**: Assume content is viewed on mobile
7. **Accessibility**: Use clear language, describe visual elements when relevant

Generate content that real users want to engage with, not just algorithm-optimized spam.`;
};

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: GeneratePostRequest = await request.json();

    // Validate required fields
    if (!body.platform || !body.postType || !body.topic) {
      return NextResponse.json(
        { error: "Missing required fields: platform, postType, topic" },
        { status: 400 },
      );
    }

    // Get platform spec for validation
    const platformSpec = getPlatformSpec(body.platform);
    if (!platformSpec) {
      return NextResponse.json(
        { error: `Unsupported platform: ${body.platform}` },
        { status: 400 },
      );
    }

    // Build user prompt
    const userPrompt = `Generate a ${body.platform} post with the following requirements:

**Post Type**: ${body.postType}
**Topic**: ${body.topic}
**Tone**: ${body.tone || "casual"}
**Content Length**: ${body.contentLength || "medium"}
**Include Hashtags**: ${body.includeHashtags !== false ? "Yes" : "No"}
**Include Image**: ${body.includeImage ? `Yes (style: ${body.imageStyle || "professional"})` : "No"}
**Include Video**: ${body.includeVideo ? `Yes (style: ${body.videoStyle || "dynamic"})` : "No"}
${body.additionalInstructions ? `\n**Additional Instructions**: ${body.additionalInstructions}` : ""}

Generate engaging, platform-optimized content that drives real engagement.`;

    // Get system prompt for platform
    const systemPrompt = getSystemPrompt(body.platform);

    console.log(
      `🤖 Generating ${body.platform} post: ${body.postType} about "${body.topic}"`,
    );

    // Initialize Google client and generate content
    const client = getGoogleClient();
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
    });

    // Extract text and usage metadata
    const text = result.text || "";
    const response = result as unknown as {
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
      };
    };

    const usageMetadata = response.usageMetadata || {};
    const inputTokens = usageMetadata.promptTokenCount || 0;
    const outputTokens = usageMetadata.candidatesTokenCount || 0;
    const totalTokens = inputTokens + outputTokens;

    // Calculate cost (Gemini 2.5 Flash approximate pricing)
    // Input: ~$0.075 per 1M tokens, Output: ~$0.30 per 1M tokens
    const costPerInputToken = 0.075 / 1_000_000;
    const costPerOutputToken = 0.3 / 1_000_000;
    const cost =
      inputTokens * costPerInputToken + outputTokens * costPerOutputToken;

    console.log(
      `✅ Generated content - Tokens: ${totalTokens} (in: ${inputTokens}, out: ${outputTokens}), Cost: $${cost.toFixed(6)}`,
    );

    // Parse JSON response
    let generatedPost;
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedPost = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse JSON response:", text, parseError);
      return NextResponse.json(
        { error: "Failed to parse AI response", details: text },
        { status: 500 },
      );
    }

    // Validate generated content against platform limits
    const contentLength = generatedPost.content?.length || 0;
    const hashtagCount = generatedPost.hashtags?.length || 0;

    if (contentLength > platformSpec.text.maxChars) {
      console.warn(
        `⚠️ Generated content exceeds limit: ${contentLength}/${platformSpec.text.maxChars}`,
      );
    }

    if (hashtagCount > platformSpec.hashtags.max) {
      console.warn(
        `⚠️ Generated hashtags exceed limit: ${hashtagCount}/${platformSpec.hashtags.max}`,
      );
      // Truncate to limit
      generatedPost.hashtags = generatedPost.hashtags.slice(
        0,
        platformSpec.hashtags.max,
      );
    }

    // Build response matching GeneratedPostData type expected by frontend
    const responseData = {
      platform: body.platform,
      post: {
        content: generatedPost.content || "",
        hashtags: generatedPost.hashtags || [],
        imagePrompt: body.includeImage ? generatedPost.imagePrompt : undefined,
        videoPrompt: body.includeVideo ? generatedPost.videoPrompt : undefined,
        metadata: {
          estimatedEngagement:
            generatedPost.metadata?.estimatedEngagement || "medium",
          contentType: generatedPost.metadata?.contentType || body.postType,
          characterCount: (generatedPost.content || "").length,
        },
      },
      usage: {
        totalTokens,
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        estimatedCostUSD: cost.toFixed(6),
      },
      generationTimeMs: Date.now() - startTime,
    };

    console.log(
      `✅ Post generation completed in ${responseData.generationTimeMs}ms`,
    );

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("❌ Error generating post:", error);
    return NextResponse.json(
      {
        error: "Failed to generate post",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
