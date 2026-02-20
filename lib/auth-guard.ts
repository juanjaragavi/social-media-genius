/**
 * Social Media Genius — API Auth Guard
 *
 * Provides authentication enforcement for API routes.
 * Returns the authenticated user or a 401 JSON response.
 *
 * Usage in route handlers:
 *   const authResult = await requireAuth();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { user, session } = authResult;
 */

import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-session";

export interface AuthenticatedContext {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
}

/**
 * Require authentication on an API route.
 *
 * @returns The authenticated user & session, or a 401 NextResponse.
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const authResult = await requireAuth();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const { user } = authResult;
 *   // user.id is the authenticated user's ID
 * }
 * ```
 */
export async function requireAuth(): Promise<
  AuthenticatedContext | NextResponse
> {
  try {
    const result = await getServerSession();

    if (!result?.user || !result?.session) {
      return NextResponse.json(
        {
          error: "No autenticado",
          message: "Debes iniciar sesión para acceder a este recurso.",
        },
        { status: 401 },
      );
    }

    return {
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        image: result.user.image,
      },
      session: {
        id: result.session.id,
        userId: result.session.userId,
        expiresAt: result.session.expiresAt,
        token: result.session.token,
      },
    };
  } catch (error) {
    console.error("❌ Auth guard error:", error);
    return NextResponse.json(
      {
        error: "Error de autenticación",
        message: "No se pudo verificar la sesión. Inicia sesión de nuevo.",
      },
      { status: 401 },
    );
  }
}
