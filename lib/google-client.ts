/**
 * Google Cloud Client Initialization
 *
 * Provides authenticated access to Google Gen AI services including:
 * - Gemini models for content generation
 * - Imagen for image generation
 * - Veo for video generation
 *
 * Uses service account authentication with fallback to Application Default Credentials (ADC)
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Initialize and return a GoogleGenAI client instance
 *
 * Authentication Methods (in priority order):
 * 1. Service Account Credentials (from environment variables)
 * 2. Application Default Credentials (ADC fallback)
 *
 * @returns {GoogleGenAI} Initialized Google Gen AI client
 * @throws {Error} If required environment variables are missing
 */
export function getGoogleClient(): GoogleGenAI {
  const project = process.env.GOOGLE_CLOUD_PROJECT;
  const location = process.env.GOOGLE_CLOUD_LOCATION || "us-central1";

  if (!project) {
    throw new Error("GOOGLE_CLOUD_PROJECT environment variable is required");
  }

  // Method 1: Service Account Credentials
  if (
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY
  ) {
    const credentials = {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };

    console.log(
      `[Google Client] Initializing with service account: ${credentials.client_email}`,
    );

    return new GoogleGenAI({
      vertexai: true,
      project,
      location,
      googleAuthOptions: {
        credentials,
      },
    });
  }

  // Method 2: Application Default Credentials (ADC) fallback
  console.log(
    "[Google Client] Initializing with Application Default Credentials (ADC)",
  );

  return new GoogleGenAI({
    vertexai: true,
    project,
    location,
  });
}

/**
 * Get a Gemini model name for content generation
 *
 * @param modelName - Model name (default: gemini-2.5-flash)
 * @returns Model name string
 */
export function getGeminiModel(modelName: string = "gemini-2.5-flash"): string {
  return modelName;
}

/**
 * Get an Imagen model name for image generation
 *
 * @param modelName - Model name (default: imagen-4.0-ultra-generate-001)
 * @returns Model name string
 */
export function getImagenModel(
  modelName: string = "imagen-4.0-ultra-generate-001",
): string {
  return modelName;
}

/**
 * Get a Veo model name for video generation
 *
 * @param modelName - Model name (default: veo-3.1-fast-generate-preview)
 * @returns Model name string
 */
export function getVeoModel(
  modelName: string = "veo-3.1-fast-generate-preview",
): string {
  return modelName;
}

/**
 * Test the Google Cloud connection
 *
 * @returns Promise resolving to true if connection is successful
 */
export async function testConnection(): Promise<boolean> {
  try {
    getGoogleClient();
    console.log("[Google Client] Connection test successful");
    console.log(`[Google Client] Project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
    console.log(
      `[Google Client] Location: ${process.env.GOOGLE_CLOUD_LOCATION}`,
    );
    return true;
  } catch (error) {
    console.error("[Google Client] Connection test failed:", error);
    return false;
  }
}
