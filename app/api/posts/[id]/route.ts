/**
 * GET    /api/posts/[id] — Fetch a single post with canvas_state
 * PATCH  /api/posts/[id] — Update canvas_state, title, thumbnail, etc.
 * DELETE /api/posts/[id] — Delete post + clean up thumbnail from storage
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  getPost,
  updatePost,
  deletePost,
} from "@/lib/services/persistence-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;

  try {
    const post = await getPost(id, auth.user.id);
    if (!post) {
      return NextResponse.json(
        { error: "Publicación no encontrada" },
        { status: 404 },
      );
    }
    return NextResponse.json({ post });
  } catch (err) {
    console.error(`❌ GET /api/posts/${id} error:`, err);
    return NextResponse.json(
      { error: "Error al obtener la publicación" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;

  try {
    const body = await request.json();

    const post = await updatePost(id, auth.user.id, {
      title: body.title,
      project_id: body.project_id,
      platform: body.platform,
      aspect_ratio: body.aspect_ratio,
      dimensions: body.dimensions,
      canvas_state: body.canvas_state,
      thumbnail_url: body.thumbnail_url,
      generation_params: body.generation_params,
    });

    return NextResponse.json({ post });
  } catch (err) {
    console.error(`❌ PATCH /api/posts/${id} error:`, err);
    return NextResponse.json(
      { error: "Error al actualizar la publicación" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;

  try {
    await deletePost(id, auth.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`❌ DELETE /api/posts/${id} error:`, err);
    return NextResponse.json(
      { error: "Error al eliminar la publicación" },
      { status: 500 },
    );
  }
}
