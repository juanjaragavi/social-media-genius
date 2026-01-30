export interface GeneratedPostData {
  platform?: string;
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
  usage?: {
    totalTokens?: number;
    promptTokens?: number;
    completionTokens?: number;
    estimatedCostUSD?: string;
  };
  generationTimeMs?: number;
  error?: string;
}
