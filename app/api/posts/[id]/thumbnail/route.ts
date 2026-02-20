/**
 * POST /api/posts/[id]/thumbnail — Upload a 400×400 JPEG thumbnail
 *
 * Accepts a base64-encoded JPEG in the request body, uploads it to
 * Supabase Storage, and updates the post's thumbnail_url.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  uploadThumbnail,
  updatePost,
} from "@/lib/services/persistence-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { base64 } = body;

    if (!base64 || typeof base64 !== "string") {
      return NextResponse.json(
        { error: "Falta el campo base64" },
        { status: 400 },
      );
    }

    // Convert base64 to Blob
    const buffer = Buffer.from(base64, "base64");
    const blob = new Blob([buffer], { type: "image/jpeg" });

    const publicUrl = await uploadThumbnail(auth.user.id, id, blob);

    // Update the post with the new thumbnail URL
    await updatePost(id, auth.user.id, { thumbnail_url: publicUrl });

    return NextResponse.json({ success: true, thumbnail_url: publicUrl });
  } catch (err) {
    console.error(`❌ POST /api/posts/${id}/thumbnail error:`, err);
    return NextResponse.json(
      { error: "Error al subir la miniatura" },
      { status: 500 },
    );
  }
}
