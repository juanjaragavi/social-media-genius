import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { requireAuth } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";

/**
 * GET /api/export/drive/token
 *
 * Returns the user's Google OAuth access token for client-side
 * Google Picker API usage. The token is obtained from Better Auth's
 * account table (same mechanism as the upload route).
 *
 * This endpoint is auth-gated and only returns the token to the
 * authenticated user who owns it.
 */
export async function GET() {
  let authResult;
  try {
    authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
  } catch {
    return NextResponse.json(
      { accessToken: null, error: "Unauthenticated" },
      { status: 401 },
    );
  }

  try {
    const tokenResponse = await auth.api.getAccessToken({
      body: { providerId: "google" },
      headers: await headers(),
    });

    if (tokenResponse?.accessToken) {
      return NextResponse.json({
        accessToken: tokenResponse.accessToken,
        email: authResult.user.email,
      });
    }

    return NextResponse.json({
      accessToken: null,
      error: "No token available",
    });
  } catch (err) {
    console.error(
      "[/api/export/drive/token] Error getting access token:",
      err instanceof Error ? err.message : err,
    );
    return NextResponse.json({
      accessToken: null,
      error: "Token retrieval failed",
    });
  }
}
