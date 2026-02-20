/**
 * Database Service for Social Media Genius
 *
 * Handles all database operations for storing and retrieving generated posts,
 * images, videos, and analytics.
 *
 * ## Multi-Tenant Isolation (RLS)
 *
 * Every query runs inside a transaction that first sets the PostgreSQL
 * session variable `app.current_user_id` to the authenticated user's ID.
 * Row Level Security policies on all user-scoped tables reference this
 * variable via `app_user_id()`, guaranteeing that:
 *
 *   - SELECT returns only the current user's rows
 *   - INSERT requires user_id = current user
 *   - UPDATE/DELETE affect only the current user's rows
 *
 * If no userId is provided, the variable is not set and RLS returns
 * zero rows (safe default — no data leaks).
 */

import { Pool, PoolClient } from "pg";

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

// ───────────────────────────────────────────────────────────────
// RLS Helper: run a callback inside a transaction with the user
// identity set for Row Level Security.
// ───────────────────────────────────────────────────────────────

/**
 * Execute a database operation within a transaction that sets the
 * RLS session variable `app.current_user_id`.
 *
 * @param userId - The authenticated user's ID (from Better Auth session)
 * @param fn     - Async function receiving the transaction client
 * @returns      The return value of `fn`
 */
async function withUserContext<T>(
  userId: string,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // SET LOCAL scopes the variable to the current transaction only,
    // which is safe with connection pooling.
    await client.query("SELECT set_config('app.current_user_id', $1, true)", [
      userId,
    ]);
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

// ───────────────────────────────────────────────────────────────
// Interfaces
// ───────────────────────────────────────────────────────────────

export interface SavePostParams {
  userId: string;
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
  userId: string;
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

export interface SaveVideoParams {
  userId: string;
  postId: string;
  platform: string;
  prompt: string;
  style?: string;
  aspectRatio?: string;
  durationSeconds?: number;
  videoUrl?: string;
  mimeType?: string;
  sizeBytes?: number;
  sizeMb?: number;
  generationTimeMs?: number;
  status?: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
}

// ───────────────────────────────────────────────────────────────
// Service
// ───────────────────────────────────────────────────────────────

export class DatabaseService {
  /**
   * Save a generated post to the database (user-scoped via RLS).
   */
  static async savePost(params: SavePostParams): Promise<string> {
    return withUserContext(params.userId, async (client) => {
      const query = `
        INSERT INTO generated_posts (
          user_id, platform, post_type, topic, content, hashtags, metadata,
          tone, content_length, additional_instructions,
          image_prompt, image_url, video_prompt, video_url,
          generation_time_ms, tokens_used, estimated_cost_usd
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `;

      const values = [
        params.userId,
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

      const result = await client.query(query, values);
      return result.rows[0].id;
    });
  }

  /**
   * Save a generated image to the database (user-scoped via RLS).
   */
  static async saveImage(params: SaveImageParams): Promise<string> {
    return withUserContext(params.userId, async (client) => {
      const query = `
        INSERT INTO generated_images (
          user_id, post_id, platform, prompt, style, aspect_ratio,
          image_url, data_url, mime_type, size_bytes, size_mb,
          dimensions, generation_time_ms
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING id
      `;

      const values = [
        params.userId,
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

      const result = await client.query(query, values);
      return result.rows[0].id;
    });
  }

  /**
   * Save a generated video to the database (user-scoped via RLS).
   */
  static async saveVideo(params: SaveVideoParams): Promise<string> {
    return withUserContext(params.userId, async (client) => {
      const query = `
        INSERT INTO generated_videos (
          user_id, post_id, platform, prompt, style, aspect_ratio,
          duration_seconds, video_url, mime_type, size_bytes, size_mb,
          generation_time_ms, status, error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `;

      const values = [
        params.userId,
        params.postId,
        params.platform,
        params.prompt,
        params.style,
        params.aspectRatio,
        params.durationSeconds,
        params.videoUrl,
        params.mimeType,
        params.sizeBytes,
        params.sizeMb,
        params.generationTimeMs,
        params.status || "pending",
        params.errorMessage,
      ];

      const result = await client.query(query, values);
      return result.rows[0].id;
    });
  }

  /**
   * Log analytics event (user-scoped via RLS).
   *
   * Analytics failures never throw — they are non-critical.
   */
  static async logAnalytics(
    userId: string,
    eventType: string,
    platform: string | null,
    durationMs: number,
    tokensUsed: number,
    costUsd: number,
    success: boolean,
    errorMessage?: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    try {
      await withUserContext(userId, async (client) => {
        const query = `
          INSERT INTO usage_analytics (
            user_id, event_type, platform, duration_ms, tokens_used, cost_usd,
            success, error_message, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;

        const values = [
          userId,
          eventType,
          platform,
          durationMs,
          tokensUsed,
          costUsd,
          success,
          errorMessage,
          metadata ? JSON.stringify(metadata) : null,
        ];

        await client.query(query, values);
      });
    } catch (error) {
      console.error("⚠️ Error logging analytics (non-fatal):", error);
      // Don't throw - analytics failures shouldn't break the app
    }
  }

  /**
   * Get recent posts for the authenticated user (RLS-filtered).
   */
  static async getRecentPosts(
    userId: string,
    limit: number = 10,
    platform?: string,
  ) {
    return withUserContext(userId, async (client) => {
      let query = `SELECT * FROM recent_activity`;
      const values: (string | number)[] = [];

      if (platform) {
        query += ` WHERE platform = $1`;
        values.push(platform);
      }

      query += ` ORDER BY created_at DESC LIMIT $${values.length + 1}`;
      values.push(limit);

      const result = await client.query(query, values);
      return result.rows;
    });
  }

  /**
   * Get platform statistics for the authenticated user (RLS-filtered).
   */
  static async getPlatformStatistics(userId: string) {
    return withUserContext(userId, async (client) => {
      const query = `SELECT * FROM platform_statistics`;
      const result = await client.query(query);
      return result.rows;
    });
  }

  /**
   * Get post by ID (RLS ensures only the owner can access it).
   */
  static async getPostById(userId: string, id: string) {
    return withUserContext(userId, async (client) => {
      const query = `
        SELECT p.*,
          (SELECT json_agg(i.*) FROM generated_images i WHERE i.post_id = p.id) as images,
          (SELECT json_agg(v.*) FROM generated_videos v WHERE v.post_id = p.id) as videos
        FROM generated_posts p
        WHERE p.id = $1
      `;

      const result = await client.query(query, [id]);
      return result.rows[0] || null;
    });
  }

  /**
   * Delete a post by ID (RLS ensures only the owner can delete).
   */
  static async deletePost(userId: string, id: string): Promise<boolean> {
    return withUserContext(userId, async (client) => {
      const result = await client.query(
        "DELETE FROM generated_posts WHERE id = $1 RETURNING id",
        [id],
      );
      return (result.rowCount ?? 0) > 0;
    });
  }

  /**
   * Test database connection (no RLS needed).
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
   * Close database connection pool.
   */
  static async close(): Promise<void> {
    await pool.end();
  }
}
