import { NextRequest, NextResponse } from "next/server";
import { getGoogleClient } from "@/lib/google-client";
import { getPlatformSpec } from "@/lib/social-platform-specs";
import { LOCALES, type OutputLocale } from "@/lib/i18n/translations";
import type { GeneratePostRequest } from "@/types/social-platforms";

// System prompt for banner-focused social media content generation
const getSystemPrompt = (
  platform: string,
  outputLocale: OutputLocale = "ES",
  bannerWidth?: number,
  bannerHeight?: number,
) => {
  const platformSpec = getPlatformSpec(platform);
  if (!platformSpec) {
    throw new Error(`Unknown platform: ${platform}`);
  }

  const localeConfig = LOCALES[outputLocale];
  const dimensionInfo =
    bannerWidth && bannerHeight
      ? `\n- **Banner Dimensions**: ${bannerWidth}×${bannerHeight} pixels`
      : "";

  const platformGuidelines: Record<string, string> = {
    instagram: `
**Instagram Strategy**:
- Visual-first platform: Banner should be the hero — content text complements stunning imagery
- Casual, authentic tone with strategic emoji use
- Storytelling approach: Hook in first 125 characters (before "more" button)
- Hashtags: 3-5 highly relevant tags (2026 limit is 5 max)
- Community engagement: Ask questions, encourage saves/shares
- Call-to-action: Natural, not pushy (e.g., "Link in bio", "DM us", "Save for later")
- Banner style: PHOTOREALISTIC, high-resolution, mobile-optimized visuals
`,
    twitter: `
**Twitter/X Strategy**:
- Concise, punchy, immediate value
- News-worthy angle or hot take
- 1-2 hashtags maximum for better engagement
- Thread-aware: Can suggest follow-up tweets
- Conversational tone, personality-driven
- Banner style: PHOTOREALISTIC, eye-catching, 16:9 landscape optimized
`,
    facebook: `
**Facebook Strategy**:
- Conversational, community-focused
- Storytelling with personal touch
- Longer form accepted but keep key message in first 2-3 lines
- 1-2 hashtags (engagement drops with 3-5)
- Banner style: PHOTOREALISTIC, high quality, shareable visuals
`,
    tiktok: `
**TikTok Strategy**:
- Video-first: Caption supports the video content
- Trending language, Gen-Z friendly
- Hook immediately with intrigue or value
- 3+ hashtags, mix of trending and niche
- Banner style: PHOTOREALISTIC, vertical 9:16, bold and dynamic
`,
    linkedin: `
**LinkedIn Strategy**:
- Professional, thought-leadership tone
- Industry insights, business value
- Data-driven or experience-based
- 3-5 industry-specific hashtags
- Banner style: PHOTOREALISTIC, professional, clean, authoritative
`,
  };

  return `# System Prompt - Social Media Banner & Post Generation for ${platformSpec.name}

You are an expert social media content strategist and banner designer specializing in creating photorealistic, platform-optimized banners and posts that drive engagement.

## LANGUAGE DIRECTIVE
${localeConfig.geminiLanguageInstruction}

## Core Mission
Generate compelling, platform-specific social media content with a PRIMARY FOCUS on photorealistic banner/image generation. Content must:
1. Respect platform character limits and constraints
2. Match the platform's cultural norms and user expectations
3. Drive measurable engagement (likes, shares, comments, saves)
4. Include HIGHLY DETAILED photorealistic image generation prompts as the PRIMARY output
5. All text content must be in the specified language

${platformGuidelines[platform] || ""}

## Platform Specifications for ${platformSpec.name}
- **Character Limit**: ${platformSpec.text.maxChars}${platformSpec.text.sweetSpot ? ` (optimal: ${platformSpec.text.sweetSpot} chars)` : ""}
- **Hashtag Limit**: ${platformSpec.hashtags.max} (recommended: ${platformSpec.hashtags.recommended})
- **Image Formats**: ${platformSpec.images.formats.join(", ")}${dimensionInfo}

## BANNER IMAGE PROMPT GUIDELINES (PRIMARY OUTPUT)

The imagePrompt is the MOST IMPORTANT part of your output. Generate a detailed, photorealistic prompt that:

1. **Photorealism First**: Describe a real-world scene, not illustrations or flat design
2. **Lighting**: Specify lighting conditions (golden hour, studio lighting, natural daylight, neon, etc.)
3. **Composition**: Describe camera angle, depth of field, focal length (e.g., "shot with 85mm f/1.4")
4. **Materials & Textures**: Describe physical textures (glossy, matte, metallic, fabric, glass)
5. **Environment**: Set a specific environment or background
6. **Colors**: Specify color palette and mood
7. **Quality Markers**: Include "8K resolution, photorealistic, hyper-detailed, professional photography"
8. **NO TEXT IN IMAGE**: The banner image should NOT contain text overlays — text is added separately in the editor
9. Minimum 80 words for the image prompt

## Content Structure Guidelines

### Hook (First Line/Sentence)
- Grab attention immediately
- Use curiosity, emotion, or value proposition

### Body (Main Content)
- Clear, scannable, valuable
- Use line breaks for readability
- Include relevant emojis naturally

### Call-to-Action
- Natural, not salesy
- Platform-appropriate

### Hashtags
- ${platformSpec.hashtags.recommended} recommended (max ${platformSpec.hashtags.max})
- Mix of broad reach and niche hashtags

## Output Format

You MUST respond with valid JSON in this exact format:

\`\`\`json
{
  "content": "The main post text content (in the specified language)",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "imagePrompt": "DETAILED photorealistic banner prompt (80+ words, in English for best Imagen results)",
  "videoPrompt": "Video generation prompt (if requested, in English)",
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
3. **Image Prompt**: MUST be detailed, photorealistic, 80+ words minimum
4. **Language**: Content text and hashtags in ${localeConfig.nativeName}; image prompts in English
5. **No Text in Images**: Image prompts must NOT include text overlays
6. **Photorealism**: Always specify photorealistic quality markers
7. **Mobile-First**: Assume content is viewed on mobile`;
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

    const outputLocale: OutputLocale =
      (body.outputLocale as OutputLocale) || "ES";
    const localeConfig = LOCALES[outputLocale];

    // Build user prompt with locale and banner dimensions
    const dimensionNote =
      body.bannerWidth && body.bannerHeight
        ? `\n**Banner Dimensions**: ${body.bannerWidth}×${body.bannerHeight} (${body.bannerAspectRatio || "custom"})`
        : "";

    const userPrompt = `Generate a ${body.platform} banner post with the following requirements:

**Post Type**: ${body.postType}
**Topic**: ${body.topic}
**Tone**: ${body.tone || "casual"}
**Content Length**: ${body.contentLength || "medium"}
**Include Hashtags**: ${body.includeHashtags !== false ? "Yes" : "No"}
**Include Image**: ${body.includeImage !== false ? "Yes — generate a DETAILED photorealistic banner prompt" : "No"}
**Image Style**: photorealistic ${body.imageStyle ? `with ${body.imageStyle} elements` : ""}
**Include Video**: ${body.includeVideo ? `Yes (style: ${body.videoStyle || "dynamic"})` : "No"}
**Output Language**: ${localeConfig.nativeName} (${outputLocale})${dimensionNote}
${body.additionalInstructions ? `\n**Additional Instructions**: ${body.additionalInstructions}` : ""}

Generate engaging, platform-optimized content with a PHOTOREALISTIC banner image prompt as the primary output.`;

    // Get system prompt for platform with locale
    const systemPrompt = getSystemPrompt(
      body.platform,
      outputLocale,
      body.bannerWidth,
      body.bannerHeight,
    );

    console.log(
      `🤖 Generating ${body.platform} banner: ${body.postType} about "${body.topic}" [${outputLocale}]`,
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
      generatedPost.hashtags = generatedPost.hashtags.slice(
        0,
        platformSpec.hashtags.max,
      );
    }

    // Auto-generate banner if image generation is enabled
    let bannerData = undefined;
    const campaignBanners = undefined;

    if (body.includeImage !== false && generatedPost.imagePrompt) {
      try {
        console.log(`🎨 Auto-generating banner image...`);
        const { ImagenService } = await import("@/lib/services/imagen-service");
        const imagenService = new ImagenService();

        const imageResult = await imagenService.generateImage({
          prompt: generatedPost.imagePrompt,
          platform: body.platform,
          aspectRatio: body.bannerAspectRatio,
          style: "realistic",
        });

        if (imageResult.success) {
          bannerData = {
            dataUrl: imageResult.dataUrl,
            base64: imageResult.base64,
            mimeType: imageResult.mimeType,
            width: body.bannerWidth,
            height: body.bannerHeight,
            aspectRatio: body.bannerAspectRatio,
          };
          console.log(`✅ Banner generated successfully`);
        } else {
          console.warn(`⚠️ Banner generation failed: ${imageResult.error}`);
        }
      } catch (imgError) {
        console.warn(`⚠️ Banner generation error:`, imgError);
      }
    }

    // Build response
    const responseData = {
      platform: body.platform,
      outputLocale,
      post: {
        content: generatedPost.content || "",
        hashtags: generatedPost.hashtags || [],
        imagePrompt: generatedPost.imagePrompt || undefined,
        videoPrompt: body.includeVideo ? generatedPost.videoPrompt : undefined,
        metadata: {
          estimatedEngagement:
            generatedPost.metadata?.estimatedEngagement || "medium",
          contentType: generatedPost.metadata?.contentType || body.postType,
          characterCount: (generatedPost.content || "").length,
        },
      },
      banner: bannerData,
      campaignBanners,
      usage: {
        totalTokens,
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        estimatedCostUSD: cost.toFixed(6),
      },
      generationTimeMs: Date.now() - startTime,
    };

    console.log(
      `✅ Banner post generation completed in ${responseData.generationTimeMs}ms`,
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
