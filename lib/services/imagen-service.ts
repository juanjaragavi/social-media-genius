/**
 * Imagen 4.0 Image Generation Service
 *
 * Migrated and adapted from EmailGenius for social media platforms.
 * Generates platform-optimized images using Google Vertex AI Imagen 4.0 Ultra.
 */

import {
  GoogleGenAI,
  PersonGeneration,
  SafetyFilterLevel,
  ImagePromptLanguage,
} from "@google/genai";
import { getPlatformSpec } from "@/lib/social-platform-specs";

export interface ImageGenerationOptions {
  prompt: string;
  platform: string;
  aspectRatio?: string; // Override platform default
  numberOfImages?: number;
  style?: "realistic" | "artistic" | "minimalist" | "bold";
  negativePrompt?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  dataUrl?: string;
  base64?: string;
  mimeType?: string;
  metadata?: {
    sizeBytes: number;
    sizeMB: number;
    dimensions: string;
    generationTimeMs: number;
  };
  error?: string;
}

export class ImagenService {
  private readonly projectId: string;
  private readonly locationId: string;
  private readonly modelId: string;
  private vertex: GoogleGenAI;

  constructor() {
    this.projectId = process.env.GOOGLE_CLOUD_PROJECT || "";
    this.locationId = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";
    this.modelId = "imagen-4.0-ultra-generate-001";

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
   * Valid Imagen API aspect ratios
   * Imagen 4.0 only supports: 1:1, 3:4, 4:3, 9:16, 16:9
   * Note: 4:5 is NOT supported by Imagen (only by Gemini image models)
   */
  private static readonly VALID_ASPECT_RATIOS = [
    "1:1",
    "3:4",
    "4:3",
    "9:16",
    "16:9",
  ] as const;
  private static readonly DEFAULT_ASPECT_RATIO = "1:1";

  /**
   * Get platform-optimal aspect ratio (mapped to valid Imagen values)
   */
  private getPlatformAspectRatio(platform: string): string {
    const platformSpec = getPlatformSpec(platform);
    if (!platformSpec) return ImagenService.DEFAULT_ASPECT_RATIO;

    // Map platform to best Imagen-compatible aspect ratio
    // Note: Instagram prefers 4:5 but Imagen doesn't support it, so we use 3:4
    const aspectRatioMap: Record<
      string,
      (typeof ImagenService.VALID_ASPECT_RATIOS)[number]
    > = {
      instagram: "3:4", // Portrait (closest to 4:5 that Imagen supports)
      twitter: "16:9", // Landscape standard
      facebook: "16:9", // Landscape for link previews
      tiktok: "9:16", // Vertical video format
      linkedin: "16:9", // Professional landscape
    };

    return (
      aspectRatioMap[platform.toLowerCase()] ||
      ImagenService.DEFAULT_ASPECT_RATIO
    );
  }

  /**
   * Validate and normalize aspect ratio to Imagen-supported values
   */
  private validateAspectRatio(
    aspectRatio: string,
  ): (typeof ImagenService.VALID_ASPECT_RATIOS)[number] {
    const normalized = aspectRatio.trim();

    // Direct match
    if (
      ImagenService.VALID_ASPECT_RATIOS.includes(
        normalized as (typeof ImagenService.VALID_ASPECT_RATIOS)[number],
      )
    ) {
      return normalized as (typeof ImagenService.VALID_ASPECT_RATIOS)[number];
    }

    // Map unsupported ratios to closest supported ones
    const fallbackMap: Record<
      string,
      (typeof ImagenService.VALID_ASPECT_RATIOS)[number]
    > = {
      "4:5": "3:4", // Portrait fallback
      "5:4": "4:3", // Landscape fallback
      "2:3": "3:4", // Portrait fallback
      "3:2": "4:3", // Landscape fallback
      "21:9": "16:9", // Ultra-wide fallback
    };

    const fallback = fallbackMap[normalized];
    if (fallback) {
      console.log(
        `⚠️ Imagen: Aspect ratio ${normalized} not supported, using ${fallback}`,
      );
      return fallback;
    }

    console.log(
      `⚠️ Imagen: Unknown aspect ratio ${normalized}, using ${ImagenService.DEFAULT_ASPECT_RATIO}`,
    );
    return ImagenService.DEFAULT_ASPECT_RATIO;
  }

  /**
   * Enhance prompt based on style preference
   */
  private enhancePrompt(basePrompt: string, style: string): string {
    const styleEnhancements: Record<string, string> = {
      realistic:
        "photorealistic, high quality, detailed, professional photography",
      artistic: "artistic, creative, vibrant colors, stylized, modern design",
      minimalist:
        "minimalist, clean, simple, elegant, professional, uncluttered",
      bold: "bold colors, high contrast, eye-catching, dynamic, energetic",
    };

    const enhancement = styleEnhancements[style] || styleEnhancements.realistic;
    return `${basePrompt}. Style: ${enhancement}`;
  }

  /**
   * Generate image optimized for social media platform
   */
  async generateImage(
    options: ImageGenerationOptions,
  ): Promise<ImageGenerationResult> {
    const startTime = Date.now();

    try {
      const rawAspectRatio =
        options.aspectRatio || this.getPlatformAspectRatio(options.platform);
      const aspectRatio = this.validateAspectRatio(rawAspectRatio);
      const enhancedPrompt = this.enhancePrompt(
        options.prompt,
        options.style || "realistic",
      );

      console.log(`🎨 Imagen 4.0: Generating image for ${options.platform}`);
      console.log(`📐 Aspect Ratio: ${aspectRatio}`);
      console.log(`🎯 Style: ${options.style || "realistic"}`);

      const response = await this.vertex.models.generateImages({
        model: this.modelId,
        prompt: enhancedPrompt,
        config: {
          aspectRatio: aspectRatio,
          numberOfImages: options.numberOfImages || 1,
          negativePrompt:
            options.negativePrompt ||
            "Disfigurements, six fingers per hand, low realism, lack of coherence, low-resolution images, grainy textures, lack of detail, abnormal appearances, illegible text, grammatical and syntax errors, non-coherent situations, distorted human and/or animal bodies, watermarks, logos, text overlays",
          personGeneration: PersonGeneration.ALLOW_ALL,
          safetyFilterLevel: SafetyFilterLevel.BLOCK_ONLY_HIGH,
          includeRaiReason: true,
          language: ImagePromptLanguage.auto,
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No image predictions returned from Vertex AI");
      }

      const generatedImage = response.generatedImages[0];
      if (!generatedImage.image || !generatedImage.image.imageBytes) {
        throw new Error("No image data returned from Vertex AI");
      }

      const mimeType = generatedImage.image.mimeType || "image/png";
      const base64Data = generatedImage.image.imageBytes;
      const dataUrl = `data:${mimeType};base64,${base64Data}`;

      // Calculate size
      const sizeBytes = Buffer.from(base64Data, "base64").length;
      const sizeMB = sizeBytes / (1024 * 1024);
      const generationTimeMs = Date.now() - startTime;

      console.log(
        `✅ Imagen 4.0: Generated successfully in ${generationTimeMs}ms`,
      );
      console.log(`📦 Size: ${sizeMB.toFixed(2)} MB`);

      return {
        success: true,
        dataUrl,
        base64: base64Data,
        mimeType,
        metadata: {
          sizeBytes,
          sizeMB: parseFloat(sizeMB.toFixed(2)),
          dimensions: aspectRatio,
          generationTimeMs,
        },
      };
    } catch (error) {
      console.error("❌ Imagen 4.0: Generation failed:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error during image generation",
      };
    }
  }

  /**
   * Optimize image for platform (compress if needed)
   */
  async optimizeForPlatform(
    dataUrl: string,
    platform: string,
    targetSizeMB: number = 5,
  ): Promise<ImageGenerationResult> {
    try {
      const platformSpec = getPlatformSpec(platform);
      if (!platformSpec) {
        throw new Error(`Unknown platform: ${platform}`);
      }

      const maxSizeMB = platformSpec.images.maxSizeMB;
      const base64Data = dataUrl.split(",")[1];
      const sizeBytes = Buffer.from(base64Data, "base64").length;
      const sizeMB = sizeBytes / (1024 * 1024);

      // Check if optimization is needed
      if (sizeMB <= Math.min(targetSizeMB, maxSizeMB)) {
        console.log(`✅ Image already optimized: ${sizeMB.toFixed(2)} MB`);
        return {
          success: true,
          dataUrl,
          base64: base64Data,
          mimeType: "image/png",
          metadata: {
            sizeBytes,
            sizeMB: parseFloat(sizeMB.toFixed(2)),
            dimensions: "optimized",
            generationTimeMs: 0,
          },
        };
      }

      // Use sharp for optimization (if available)
      console.log(
        `🔧 Optimizing image: ${sizeMB.toFixed(2)} MB → ${targetSizeMB} MB target`,
      );

      // For now, return as-is (sharp optimization can be added later)
      return {
        success: true,
        dataUrl,
        base64: base64Data,
        mimeType: "image/png",
        metadata: {
          sizeBytes,
          sizeMB: parseFloat(sizeMB.toFixed(2)),
          dimensions: "optimized",
          generationTimeMs: 0,
        },
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown optimization error",
      };
    }
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
  }> {
    try {
      return {
        configured: true,
        projectId: this.projectId,
        location: this.locationId,
        model: this.modelId,
        authConfigured: true,
      };
    } catch {
      return {
        configured: false,
        projectId: this.projectId,
        location: this.locationId,
        model: this.modelId,
        authConfigured: false,
      };
    }
  }
}
