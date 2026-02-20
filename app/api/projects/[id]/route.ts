/**
 * PATCH  /api/projects/[id] — Rename / update a project
 * DELETE /api/projects/[id] — Delete a project (posts get project_id = NULL)
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  updateProject,
  deleteProject,
} from "@/lib/services/persistence-service";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;

  try {
    const body = await request.json();
    const { name, description } = body;

    const project = await updateProject(id, auth.user.id, {
      name: name?.trim(),
      description: description !== undefined ? description?.trim() : undefined,
    });

    return NextResponse.json({ project });
  } catch (err) {
    console.error(`❌ PATCH /api/projects/${id} error:`, err);
    return NextResponse.json(
      { error: "Error al actualizar el proyecto" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const { id } = await context.params;

  try {
    await deleteProject(id, auth.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(`❌ DELETE /api/projects/${id} error:`, err);
    return NextResponse.json(
      { error: "Error al eliminar el proyecto" },
      { status: 500 },
    );
  }
}
