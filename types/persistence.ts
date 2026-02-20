/**
 * Persistence Types — Projects & Posts
 *
 * Canonical types for the persistence layer. Posts store serialized
 * canvas state (layers + base image) and generation metadata.
 */

import type { AnyEditorElement } from "@/types/editor";

// ─── Canvas State ─────────────────────────────────────────

/** Serialized form persisted in posts.canvas_state */
export interface CanvasState {
  /** Base / background image URL or data-URL */
  baseImageUrl: string | null;
  /** Canvas background colour (hex) */
  backgroundColor: string;
  /** All editor layers ordered by z-index */
  layers: AnyEditorElement[];
}

// ─── Generation Parameters ────────────────────────────────

export interface GenerationParams {
  theme?: string;
  tone?: string;
  language?: string;
  imageStyle?: string;
  postType?: string;
  outputLocale?: string;
}

// ─── Dimensions ───────────────────────────────────────────

export interface Dimensions {
  width: number;
  height: number;
}

// ─── Project ──────────────────────────────────────────────

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  /** Virtual field — populated by API joins */
  post_count?: number;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
}

// ─── Post ─────────────────────────────────────────────────

export interface Post {
  id: string;
  project_id: string | null;
  user_id: string;
  title: string;
  platform: string | null;
  aspect_ratio: string | null;
  dimensions: Dimensions | null;
  canvas_state: CanvasState | null;
  thumbnail_url: string | null;
  generation_params: GenerationParams | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  title?: string;
  project_id?: string | null;
  platform?: string;
  aspect_ratio?: string;
  dimensions?: Dimensions;
  canvas_state?: CanvasState;
  generation_params?: GenerationParams;
}

export interface UpdatePostInput {
  title?: string;
  project_id?: string | null;
  platform?: string;
  aspect_ratio?: string;
  dimensions?: Dimensions;
  canvas_state?: CanvasState;
  thumbnail_url?: string;
  generation_params?: GenerationParams;
}

// ─── API Query Params ─────────────────────────────────────

export interface PostsQueryParams {
  project_id?: string;
  platform?: string;
  aspect_ratio?: string;
  sort?: "updated_at" | "created_at" | "title";
  search?: string;
  limit?: number;
  offset?: number;
}
