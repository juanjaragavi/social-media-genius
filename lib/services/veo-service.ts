/**
 * Google Veo 3.1 Video Generation Service
 *
 * Generates platform-optimized videos for TikTok, Instagram Reels, YouTube Shorts, etc.
 * Uses Google Vertex AI Veo 3.1 Fast Generate Preview.
 */

import { GoogleGenAI } from "@google/genai";
import { getPlatformSpec } from "@/lib/social-platform-specs";

export interface VideoGenerationOptions {
  prompt: string;
  platform: string;
  durationSeconds?: number;
  aspectRatio?: string;
  style?: "cinematic" | "fast-paced" | "smooth" | "dynamic";
  negativePrompt?: string;
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  base64?: string;
  mimeType?: string;
  metadata?: {
    sizeBytes: number;
    sizeMB: number;
    durationSeconds: number;
    dimensions: string;
    generationTimeMs: number;
  };
  error?: string;
}

export class VeoService {
  private readonly projectId: string;
  private readonly locationId: string;
  private readonly modelId: string;
  private vertex: GoogleGenAI;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || "";
    this.locationId = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    // Veo 3.1 Fast Generate Preview model
    this.modelId = "veo-3.1-fast-generate-preview";

    if (!this.projectId) {
      throw new Error("GOOGLE_CLOUD_PROJECT environment variable is required");
    }

    const credentials = this.getServiceAccountCredentials();

    this.vertex = new GoogleGenAI({
      vertexai: true,
      project: this.projectId,
      location: this.locationId,
      googleAuthOptions: {
        credentials,
      },
    });
  }

  private getServiceAccountCredentials() {
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!serviceAccountEmail || !privateKey) {
      throw new Error(
        "GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY environment variables are required",
      );
    }

    return {
      type: "service_account",
      project_id: this.projectId,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID || "",
      private_key: privateKey.replace(/\\n/g, "\n"),
      client_email: serviceAccountEmail,
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
        serviceAccountEmail,
      )}`,
    };
  }

  /**
   * Get platform-optimal video settings
   */
  private getPlatformVideoSettings(platform: string): {
    aspectRatio: string;
    duration: number;
  } {
    // Platform-specific video configurations
    const settingsMap: Record<
      string,
      { aspectRatio: string; duration: number }
    > = {
      instagram: { aspectRatio: "9:16", duration: 60 }, // Reels up to 90s, but 60s is sweet spot
      twitter: { aspectRatio: "16:9", duration: 45 }, // 2:20 max, but shorter performs better
      facebook: { aspectRatio: "9:16", duration: 60 }, // Stories format
      tiktok: { aspectRatio: "9:16", duration: 30 }, // 15-60s optimal, 30s sweet spot
      linkedin: { aspectRatio: "16:9", duration: 90 }, // Professional, can be longer
    };

    return (
      settingsMap[platform.toLowerCase()] || {
        aspectRatio: "16:9",
        duration: 30,
      }
    );
  }

  /**
   * Enhance video prompt based on style
   */
  private enhanceVideoPrompt(
    basePrompt: string,
    style: string,
    platform: string,
  ): string {
    const styleEnhancements: Record<string, string> = {
      cinematic:
        "cinematic camera movements, professional lighting, smooth transitions, high production value",
      "fast-paced":
        "quick cuts, dynamic movement, energetic pacing, rapid scene changes, trending style",
      smooth:
        "smooth camera movements, steady shots, gentle transitions, professional flow",
      dynamic:
        "dynamic angles, varied perspectives, engaging movement, attention-grabbing visuals",
    };

    const platformHints: Record<string, string> = {
      tiktok:
        "trending TikTok style, mobile-first, hook in first 3 seconds, vertical format",
      instagram:
        "Instagram Reels aesthetic, polished, visually appealing, mobile-optimized",
      twitter: "news-worthy, quick to the point, professional",
      facebook: "engaging, shareable, community-focused",
      linkedin: "professional, business-appropriate, informative",
    };

    const enhancement = styleEnhancements[style] || styleEnhancements.dynamic;
    const platformHint = platformHints[platform.toLowerCase()] || "";

    return `${basePrompt}. ${enhancement}. ${platformHint}`;
  }

  /**
   * Generate video optimized for social media platform
   */
  async generateVideo(
    options: VideoGenerationOptions,
  ): Promise<VideoGenerationResult> {
    const startTime = Date.now();

    try {
      const platformSettings = this.getPlatformVideoSettings(options.platform);
      const aspectRatio = options.aspectRatio || platformSettings.aspectRatio;
      const durationSeconds =
        options.durationSeconds || platformSettings.duration;
      const enhancedPrompt = this.enhanceVideoPrompt(
        options.prompt,
        options.style || "dynamic",
        options.platform,
      );

      console.log(`🎬 Veo 3.1: Generating video for ${options.platform}`);
      console.log(`📐 Aspect Ratio: ${aspectRatio}`);
      console.log(`⏱️  Duration: ${durationSeconds}s`);
      console.log(`🎯 Style: ${options.style || "dynamic"}`);

      // Note: Veo API interface may vary. This is based on expected Vertex AI patterns.
      // The actual implementation will depend on the final Veo 3.1 SDK release.

      // For now, we'll return a placeholder since Veo 3.1 API specifics may still be evolving
      // This structure follows the pattern of Imagen but adapted for video

      console.log(
        "⚠️  Veo 3.1: Video generation is in preview. Using placeholder response.",
      );
      console.log(`📝 Enhanced Prompt: ${enhancedPrompt.substring(0, 100)}...`);

      // Placeholder response structure
      // When the actual API is available, implement the real call here
      const generationTimeMs = Date.now() - startTime;

      return {
        success: false,
        error:
          "Veo 3.1 video generation is not yet available in this SDK version. Please check Google Cloud documentation for the latest API.",
        metadata: {
          sizeBytes: 0,
          sizeMB: 0,
          durationSeconds,
          dimensions: aspectRatio,
          generationTimeMs,
        },
      };

      /* Expected implementation when API is available:
      const response = await this.vertex.models.generateVideo({
        model: this.modelId,
        prompt: enhancedPrompt,
        config: {
          aspectRatio: aspectRatio as any,
          durationSeconds,
          negativePrompt: options.negativePrompt || 
            'Low quality, blurry, distorted, choppy, poor lighting, watermarks, logos',
          safetyFilterLevel: 'BLOCK_ONLY_HIGH',
        },
      });

      const videoData = response.generatedVideos?.[0];
      if (!videoData?.video?.videoBytes) {
        throw new Error('No video data returned');
      }

      const mimeType = videoData.video.mimeType || 'video/mp4';
      const base64Data = videoData.video.videoBytes;
      const videoUrl = `data:${mimeType};base64,${base64Data}`;
      const sizeBytes = Buffer.from(base64Data, 'base64').length;
      const sizeMB = sizeBytes / (1024 * 1024);

      return {
        success: true,
        videoUrl,
        base64: base64Data,
        mimeType,
        metadata: {
          sizeBytes,
          sizeMB: parseFloat(sizeMB.toFixed(2)),
          durationSeconds,
          dimensions: aspectRatio,
          generationTimeMs: Date.now() - startTime,
        },
      };
      */
    } catch (error) {
      console.error("❌ Veo 3.1: Generation failed:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during video generation",
      };
    }
  }

  /**
   * Check if video meets platform requirements
   */
  async validateForPlatform(
    videoSizeMB: number,
    durationSeconds: number,
    platform: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const platformSpec = getPlatformSpec(platform);
    if (!platformSpec) {
      return { valid: false, errors: [`Unknown platform: ${platform}`] };
    }

    const errors: string[] = [];

    // Check size
    if (videoSizeMB > platformSpec.videos.maxSizeMB) {
      errors.push(
        `Video size ${videoSizeMB.toFixed(2)} MB exceeds platform limit of ${platformSpec.videos.maxSizeMB} MB`,
      );
    }

    // Check duration
    if (durationSeconds > platformSpec.videos.maxDurationSeconds) {
      errors.push(
        `Video duration ${durationSeconds}s exceeds platform limit of ${platformSpec.videos.maxDurationSeconds}s`,
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{
    configured: boolean;
    projectId: string;
    location: string;
    model: string;
    authConfigured: boolean;
    available: boolean;
  }> {
    try {
      return {
        configured: true,
        projectId: this.projectId,
        location: this.locationId,
        model: this.modelId,
        authConfigured: true,
        available: false, // Will be true when API is available
      };
    } catch {
      return {
        configured: false,
        projectId: this.projectId,
        location: this.locationId,
        model: this.modelId,
        authConfigured: false,
        available: false,
      };
    }
  }
}
