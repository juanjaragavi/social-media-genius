/**
 * Persistence Service — Projects & Posts CRUD via Supabase
 *
 * Uses the service-role admin client (bypasses RLS).
 * All access-control is enforced in the API layer via `requireAuth()`.
 */

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type {
  Project,
  CreateProjectInput,
  UpdateProjectInput,
  Post,
  CreatePostInput,
  UpdatePostInput,
  PostsQueryParams,
} from "@/types/persistence";

// ─── Singleton Admin Client ─────────────────────────────────

let adminClient: SupabaseClient | null = null;

function getAdmin(): SupabaseClient {
  if (adminClient) return adminClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  adminClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return adminClient;
}

// ─── Projects ───────────────────────────────────────────────

export async function listProjects(userId: string): Promise<Project[]> {
  const db = getAdmin();
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("❌ listProjects error:", error.message);
    throw new Error(error.message);
  }

  // Attach post counts
  const projects = (data ?? []) as Project[];
  if (projects.length > 0) {
    const ids = projects.map((p) => p.id);
    const { data: counts, error: countError } = await db
      .from("posts")
      .select("project_id")
      .in("project_id", ids);

    if (!countError && counts) {
      const countMap: Record<string, number> = {};
      for (const row of counts) {
        countMap[row.project_id] = (countMap[row.project_id] || 0) + 1;
      }
      for (const project of projects) {
        project.post_count = countMap[project.id] || 0;
      }
    }
  }

  return projects;
}

export async function getProject(
  projectId: string,
  userId: string,
): Promise<Project | null> {
  const db = getAdmin();
  const { data, error } = await db
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    console.error("❌ getProject error:", error.message);
    throw new Error(error.message);
  }

  return data as Project;
}

export async function createProject(
  userId: string,
  input: CreateProjectInput,
): Promise<Project> {
  const db = getAdmin();
  const { data, error } = await db
    .from("projects")
    .insert({
      user_id: userId,
      name: input.name,
      description: input.description ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ createProject error:", error.message);
    throw new Error(error.message);
  }

  return { ...(data as Project), post_count: 0 };
}

export async function updateProject(
  projectId: string,
  userId: string,
  input: UpdateProjectInput,
): Promise<Project> {
  const db = getAdmin();
  const updates: Record<string, unknown> = {};
  if (input.name !== undefined) updates.name = input.name;
  if (input.description !== undefined) updates.description = input.description;

  const { data, error } = await db
    .from("projects")
    .update(updates)
    .eq("id", projectId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("❌ updateProject error:", error.message);
    throw new Error(error.message);
  }

  return data as Project;
}

export async function deleteProject(
  projectId: string,
  userId: string,
): Promise<void> {
  const db = getAdmin();
  const { error } = await db
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", userId);

  if (error) {
    console.error("❌ deleteProject error:", error.message);
    throw new Error(error.message);
  }
}

// ─── Posts ──────────────────────────────────────────────────

export async function listPosts(
  userId: string,
  params: PostsQueryParams = {},
): Promise<Post[]> {
  const db = getAdmin();
  let query = db.from("posts").select("*").eq("user_id", userId);

  // Filters
  if (params.project_id) {
    query = query.eq("project_id", params.project_id);
  }
  if (params.platform) {
    query = query.eq("platform", params.platform);
  }
  if (params.aspect_ratio) {
    query = query.eq("aspect_ratio", params.aspect_ratio);
  }
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  // Sort
  const sortField = params.sort || "updated_at";
  const ascending = sortField === "title";
  query = query.order(sortField, { ascending });

  // Pagination
  const limit = params.limit || 50;
  const offset = params.offset || 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    console.error("❌ listPosts error:", error.message);
    throw new Error(error.message);
  }

  return (data ?? []) as Post[];
}

export async function getPost(
  postId: string,
  userId: string,
): Promise<Post | null> {
  const db = getAdmin();
  const { data, error } = await db
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    console.error("❌ getPost error:", error.message);
    throw new Error(error.message);
  }

  return data as Post;
}

export async function createPost(
  userId: string,
  input: CreatePostInput = {},
): Promise<Post> {
  const db = getAdmin();
  const { data, error } = await db
    .from("posts")
    .insert({
      user_id: userId,
      title: input.title ?? "Sin título",
      project_id: input.project_id ?? null,
      platform: input.platform ?? null,
      aspect_ratio: input.aspect_ratio ?? null,
      dimensions: input.dimensions ?? null,
      canvas_state: input.canvas_state ?? null,
      generation_params: input.generation_params ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("❌ createPost error:", error.message);
    throw new Error(error.message);
  }

  return data as Post;
}

export async function updatePost(
  postId: string,
  userId: string,
  input: UpdatePostInput,
): Promise<Post> {
  const db = getAdmin();
  const updates: Record<string, unknown> = {};

  if (input.title !== undefined) updates.title = input.title;
  if (input.project_id !== undefined) updates.project_id = input.project_id;
  if (input.platform !== undefined) updates.platform = input.platform;
  if (input.aspect_ratio !== undefined)
    updates.aspect_ratio = input.aspect_ratio;
  if (input.dimensions !== undefined) updates.dimensions = input.dimensions;
  if (input.canvas_state !== undefined)
    updates.canvas_state = input.canvas_state;
  if (input.thumbnail_url !== undefined)
    updates.thumbnail_url = input.thumbnail_url;
  if (input.generation_params !== undefined)
    updates.generation_params = input.generation_params;

  const { data, error } = await db
    .from("posts")
    .update(updates)
    .eq("id", postId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("❌ updatePost error:", error.message);
    throw new Error(error.message);
  }

  return data as Post;
}

export async function deletePost(
  postId: string,
  userId: string,
): Promise<void> {
  const db = getAdmin();

  // Fetch the post to get thumbnail path for cleanup
  const post = await getPost(postId, userId);

  // Delete the post row
  const { error } = await db
    .from("posts")
    .delete()
    .eq("id", postId)
    .eq("user_id", userId);

  if (error) {
    console.error("❌ deletePost error:", error.message);
    throw new Error(error.message);
  }

  // Clean up thumbnail from storage
  if (post?.thumbnail_url) {
    try {
      const storagePath = extractStoragePath(post.thumbnail_url);
      if (storagePath) {
        await db.storage.from("post-thumbnails").remove([storagePath]);
      }
    } catch (err) {
      console.warn("⚠️ Failed to delete thumbnail from storage:", err);
    }
  }
}

// ─── Thumbnail Upload ───────────────────────────────────────

export async function uploadThumbnail(
  userId: string,
  postId: string,
  jpegBlob: Blob,
): Promise<string> {
  const db = getAdmin();
  const path = `${userId}/${postId}.jpg`;

  const { error: uploadError } = await db.storage
    .from("post-thumbnails")
    .upload(path, jpegBlob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (uploadError) {
    console.error("❌ uploadThumbnail error:", uploadError.message);
    throw new Error(uploadError.message);
  }

  const {
    data: { publicUrl },
  } = db.storage.from("post-thumbnails").getPublicUrl(path);

  return publicUrl;
}

// ─── Helpers ────────────────────────────────────────────────

function extractStoragePath(publicUrl: string): string | null {
  // Supabase public URLs have the pattern:
  // https://<project>.supabase.co/storage/v1/object/public/post-thumbnails/<path>
  const marker = "/post-thumbnails/";
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
