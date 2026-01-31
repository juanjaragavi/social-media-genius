/**
 * Database Service for Social Media Genius
 *
 * Handles all database operations for storing and retrieving generated posts,
 * images, videos, and analytics.
 */

import { Pool } from "pg";

// Initialize PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export interface SavePostParams {
  platform: string;
  postType: string;
  topic: string;
  content: string;
  hashtags: string[];
  metadata: Record<string, unknown>;
  tone?: string;
  contentLength?: string;
  additionalInstructions?: string;
  imagePrompt?: string;
  imageUrl?: string;
  videoPrompt?: string;
  videoUrl?: string;
  generationTimeMs: number;
  tokensUsed: number;
  estimatedCostUsd: number;
}

export interface SaveImageParams {
  postId: string;
  platform: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  imageUrl?: string;
  dataUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  sizeMb?: number;
  dimensions?: string;
  generationTimeMs?: number;
}

export class DatabaseService {
  /**
   * Save a generated post to the database
   */
  static async savePost(params: SavePostParams): Promise<string> {
    const query = `
      INSERT INTO generated_posts (
        platform, post_type, topic, content, hashtags, metadata,
        tone, content_length, additional_instructions,
        image_prompt, image_url, video_prompt, video_url,
        generation_time_ms, tokens_used, estimated_cost_usd
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING id
    `;

    const values = [
      params.platform,
      params.postType,
      params.topic,
      params.content,
      params.hashtags,
      JSON.stringify(params.metadata),
      params.tone,
      params.contentLength,
      params.additionalInstructions,
      params.imagePrompt,
      params.imageUrl,
      params.videoPrompt,
      params.videoUrl,
      params.generationTimeMs,
      params.tokensUsed,
      params.estimatedCostUsd,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error("Error saving post:", error);
      throw error;
    }
  }

  /**
   * Save a generated image to the database
   */
  static async saveImage(params: SaveImageParams): Promise<string> {
    const query = `
      INSERT INTO generated_images (
        post_id, platform, prompt, style, aspect_ratio,
        image_url, data_url, mime_type, size_bytes, size_mb,
        dimensions, generation_time_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id
    `;

    const values = [
      params.postId,
      params.platform,
      params.prompt,
      params.style,
      params.aspectRatio,
      params.imageUrl,
      params.dataUrl,
      params.mimeType,
      params.sizeBytes,
      params.sizeMb,
      params.dimensions,
      params.generationTimeMs,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0].id;
    } catch (error) {
      console.error("Error saving image:", error);
      throw error;
    }
  }

  /**
   * Log analytics event
   */
  static async logAnalytics(
    eventType: string,
    platform: string | null,
    durationMs: number,
    tokensUsed: number,
    costUsd: number,
    success: boolean,
    errorMessage?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const query = `
      INSERT INTO usage_analytics (
        event_type, platform, duration_ms, tokens_used, cost_usd,
        success, error_message, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    const values = [
      eventType,
      platform,
      durationMs,
      tokensUsed,
      costUsd,
      success,
      errorMessage,
      metadata ? JSON.stringify(metadata) : null,
    ];

    try {
      await pool.query(query, values);
    } catch (error) {
      console.error("Error logging analytics:", error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Get recent posts
   */
  static async getRecentPosts(limit: number = 10, platform?: string) {
    let query = `
      SELECT * FROM recent_activity
    `;

    const values: (string | number)[] = [];

    if (platform) {
      query += ` WHERE platform = $1`;
      values.push(platform);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
    values.push(limit);

    try {
      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      console.error("Error fetching recent posts:", error);
      throw error;
    }
  }

  /**
   * Get platform statistics
   */
  static async getPlatformStatistics() {
    const query = `SELECT * FROM platform_statistics`;

    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      console.error("Error fetching platform statistics:", error);
      throw error;
    }
  }

  /**
   * Get post by ID
   */
  static async getPostById(id: string) {
    const query = `
      SELECT p.*,
        (SELECT json_agg(i.*) FROM generated_images i WHERE i.post_id = p.id) as images,
        (SELECT json_agg(v.*) FROM generated_videos v WHERE v.post_id = p.id) as videos
      FROM generated_posts p
      WHERE p.id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  static async testConnection(): Promise<boolean> {
    try {
      await pool.query("SELECT NOW()");
      return true;
    } catch (error) {
      console.error("Database connection test failed:", error);
      return false;
    }
  }

  /**
   * Close database connection pool
   */
  static async close(): Promise<void> {
    await pool.end();
  }
}
