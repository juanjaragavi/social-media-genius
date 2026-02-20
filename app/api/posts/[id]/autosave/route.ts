/**
 * POST /api/posts/[id]/autosave — Beacon-friendly autosave endpoint
 *
 * Accepts POST (for navigator.sendBeacon compatibility) to update
 * canvas_state on the post. Used on beforeunload to persist final state.
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import { updatePost } from "@/lib/services/persistence-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;

  try {
    const body = await request.json();

    await updatePost(id, auth.user.id, {
      canvas_state: body.canvas_state,
      dimensions: body.dimensions,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`❌ POST /api/posts/${id}/autosave error:`, err);
    return NextResponse.json(
      { error: "Error al guardar automáticamente" },
      { status: 500 },
    );
  }
}
