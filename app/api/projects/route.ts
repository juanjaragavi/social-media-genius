/**
 * GET  /api/projects — List authenticated user's projects
 * POST /api/projects — Create a new project
 */

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-guard";
import {
  listProjects,
  createProject,
} from "@/lib/services/persistence-service";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const projects = await listProjects(auth.user.id);
    return NextResponse.json({ projects });
  } catch (err) {
    console.error("❌ GET /api/projects error:", err);
    return NextResponse.json(
      { error: "Error al obtener proyectos" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { error: "El nombre del proyecto es obligatorio" },
        { status: 400 },
      );
    }

    const project = await createProject(auth.user.id, {
      name: name.trim(),
      description: description?.trim() || undefined,
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/projects error:", err);
    return NextResponse.json(
      { error: "Error al crear el proyecto" },
      { status: 500 },
    );
  }
}
