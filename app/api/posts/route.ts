/**
 * GET  /api/posts — List authenticated user's posts (supports filters)
 * POST /api/posts — Create a new post
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { listPosts, createPost } from "@/lib/services/persistence-service";
import type { PostsQueryParams } from "@/types/persistence";

export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const url = request.nextUrl;
    const params: PostsQueryParams = {};

    if (url.searchParams.has("project_id"))
      params.project_id = url.searchParams.get("project_id")!;
    if (url.searchParams.has("platform"))
      params.platform = url.searchParams.get("platform")!;
    if (url.searchParams.has("aspect_ratio"))
      params.aspect_ratio = url.searchParams.get("aspect_ratio")!;
    if (url.searchParams.has("search"))
      params.search = url.searchParams.get("search")!;
    if (url.searchParams.has("sort")) {
      const sort = url.searchParams.get("sort")!;
      if (["updated_at", "created_at", "title"].includes(sort)) {
        params.sort = sort as PostsQueryParams["sort"];
      }
    }
    if (url.searchParams.has("limit"))
      params.limit = parseInt(url.searchParams.get("limit")!, 10);
    if (url.searchParams.has("offset"))
      params.offset = parseInt(url.searchParams.get("offset")!, 10);

    const posts = await listPosts(auth.user.id, params);
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("❌ GET /api/posts error:", err);
    return NextResponse.json(
      { error: "Error al obtener publicaciones" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const post = await createPost(auth.user.id, {
      title: body.title,
      project_id: body.project_id,
      platform: body.platform,
      aspect_ratio: body.aspect_ratio,
      dimensions: body.dimensions,
      canvas_state: body.canvas_state,
      generation_params: body.generation_params,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/posts error:", err);
    return NextResponse.json(
      { error: "Error al crear la publicación" },
      { status: 500 },
    );
  }
}
