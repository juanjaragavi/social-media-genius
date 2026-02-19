export interface GeneratedPostData {
  platform?: string;
  outputLocale?: string;
  post?: {
    content: string;
    hashtags?: string[];
    imagePrompt?: string;
    videoPrompt?: string;
    metadata?: {
      estimatedEngagement?: string;
      contentType?: string;
      characterCount?: number;
    };
  };
  /** Generated banner image data */
  banner?: {
    dataUrl?: string;
    base64?: string;
    mimeType?: string;
    width?: number;
    height?: number;
    aspectRatio?: string;
  };
  /** Campaign mode: multiple banners for different dimensions */
  campaignBanners?: Array<{
    dataUrl?: string;
    base64?: string;
    mimeType?: string;
    width: number;
    height: number;
    aspectRatio: string;
    label: string;
  }>;
  usage?: {
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCostUSD?: string;
  };
  generationTimeMs?: number;
  error?: string;
}
