/**
 * Type Definitions for Social Media Platforms
 */

export type Platform =
  | "instagram"
  | "twitter"
  | "facebook"
  | "tiktok"
  | "linkedin";

export type PostType =
  | "promotional"
  | "educational"
  | "entertaining"
  | "news"
  | "announcement"
  | "behind-the-scenes"
  | "user-generated"
  | "poll"
  | "question";

export type Tone =
  | "casual"
  | "professional"
  | "friendly"
  | "urgent"
  | "inspiring"
  | "humorous"
  | "empathetic"
  | "authoritative";

export type ContentLength = "short" | "medium" | "long";

export type ImageStyle =
  | "product-photo"
  | "lifestyle"
  | "infographic"
  | "illustration"
  | "minimalist"
  | "vibrant"
  | "professional"
  | "candid";

export type VideoStyle =
  | "dynamic"
  | "cinematic"
  | "tutorial"
  | "behind-the-scenes"
  | "product-showcase"
  | "testimonial"
  | "animated"
  | "timelapse";

/** Output locale for generated content */
export type OutputLocale = "EN" | "ES" | "BR";

/** Banner dimension preset */
export interface BannerDimensionPreset {
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface GeneratePostRequest {
  platform: Platform;
  postType: PostType;
  topic: string;
  tone?: Tone;
  contentLength?: ContentLength;
  includeHashtags?: boolean;
  includeImage?: boolean;
  imageStyle?: ImageStyle;
  includeVideo?: boolean;
  videoStyle?: VideoStyle;
  additionalInstructions?: string;
  sessionId?: string;
  /** Output language for generated content */
  outputLocale?: OutputLocale;
  /** Banner dimensions (width x height) */
  bannerWidth?: number;
  bannerHeight?: number;
  bannerAspectRatio?: string;
  /** Campaign mode: generate for multiple dimensions */
  campaignMode?: boolean;
  campaignDimensions?: BannerDimensionPreset[];
}

export interface GeneratePostResponse {
  content: string;
  hashtags: string[];
  imagePrompt?: string;
  videoPrompt?: string;
  openGraphTags?: {
    title: string;
    description: string;
    image?: string;
  };
  platformOptimizations?: Record<
    Platform,
    {
      content: string;
      hashtags: string[];
    }
  >;
  metadata: {
    model: string;
    tokensUsed: {
      input: number;
      output: number;
      total: number;
    };
    cost: number;
    generationTime: number;
  };
}

export interface SocialPost {
  id: string;
  sessionId: string;
  platform: Platform;
  postType: PostType;
  content: string;
  hashtags: string[];
  imageUrl?: string;
  videoUrl?: string;
  imagePrompt?: string;
  videoPrompt?: string;
  configuration: GeneratePostRequest;
  generatedContent: GeneratePostResponse;
  validationResults?: unknown;
  status: "draft" | "generated" | "published";
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    cost: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
