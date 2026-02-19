/**
 * Supabase Service - Cloud Storage & Database
 *
 * Requires the following environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key (server-side only)
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY - Anonymous key (client-side)
 *
 * Storage bucket: "banners" (must be created in Supabase dashboard)
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy singleton for server-side Supabase client
let supabaseAdmin: SupabaseClient | null = null;

function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
    );
  }

  supabaseAdmin = createClient(url, key, {
    auth: { persistSession: false },
  });

  return supabaseAdmin;
}

// Client-side Supabase (for browser use with anon key)
export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createClient(url, key);
}

const BUCKET_NAME = "banners";

export interface UploadResult {
  success: boolean;
  path?: string;
  publicUrl?: string;
  error?: string;
}

export interface StoredBanner {
  id: string;
  path: string;
  publicUrl: string;
  platform: string;
  width: number;
  height: number;
  locale: string;
  createdAt: string;
}

export class SupabaseService {
  private client: SupabaseClient;

  constructor() {
    this.client = getSupabaseAdmin();
  }

  /**
   * Upload a banner image to Supabase Storage
   */
  async uploadBanner(
    base64Data: string,
    filename: string,
    mimeType: string = "image/png",
    metadata?: {
      platform?: string;
      width?: number;
      height?: number;
      locale?: string;
    },
  ): Promise<UploadResult> {
    try {
      // Convert base64 to buffer
      const buffer = Buffer.from(base64Data, "base64");
      const filePath = `banners/${Date.now()}_${filename}`;

      const { error } = await this.client.storage
        .from(BUCKET_NAME)
        .upload(filePath, buffer, {
          contentType: mimeType,
          upsert: false,
          metadata: metadata
            ? {
                platform: metadata.platform || "",
                width: String(metadata.width || 0),
                height: String(metadata.height || 0),
                locale: metadata.locale || "ES",
              }
            : undefined,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = this.client.storage.from(BUCKET_NAME).getPublicUrl(filePath);

      return {
        success: true,
        path: filePath,
        publicUrl,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Upload failed",
      };
    }
  }

  /**
   * List banners in storage
   */
  async listBanners(
    limit: number = 50,
    offset: number = 0,
  ): Promise<StoredBanner[]> {
    const { data, error } = await this.client.storage
      .from(BUCKET_NAME)
      .list("banners", {
        limit,
        offset,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error || !data) {
      console.error("Failed to list banners:", error);
      return [];
    }

    return data.map((file) => ({
      id: file.id,
      path: `banners/${file.name}`,
      publicUrl: this.client.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`banners/${file.name}`).data.publicUrl,
      platform:
        (file.metadata as Record<string, string>)?.platform || "unknown",
      width: Number((file.metadata as Record<string, string>)?.width) || 0,
      height: Number((file.metadata as Record<string, string>)?.height) || 0,
      locale: (file.metadata as Record<string, string>)?.locale || "ES",
      createdAt: file.created_at,
    }));
  }

  /**
   * Delete a banner from storage
   */
  async deleteBanner(path: string): Promise<boolean> {
    const { error } = await this.client.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error("Failed to delete banner:", error);
      return false;
    }

    return true;
  }

  /**
   * Health check - verify Supabase connection and bucket exist
   */
  async healthCheck(): Promise<{
    connected: boolean;
    bucketExists: boolean;
    error?: string;
  }> {
    try {
      const { data, error } = await this.client.storage.listBuckets();

      if (error) {
        return {
          connected: false,
          bucketExists: false,
          error: error.message,
        };
      }

      const bucketExists = data.some((b) => b.name === BUCKET_NAME);

      return { connected: true, bucketExists };
    } catch (err) {
      return {
        connected: false,
        bucketExists: false,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
