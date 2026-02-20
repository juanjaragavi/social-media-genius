import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { GoogleDriveService } from "@/lib/services/google-drive-service";
import { requireAuth } from "@/lib/auth-guard";
import { auth } from "@/lib/auth";

/**
 * POST /api/export/drive
 *
 * Upload a composited banner PNG to Google Drive.
 *
 * Authentication flow:
 *   1. Try the user's own Google OAuth access token (via Better Auth).
 *      → Files appear in the **user's** Google Drive.
 *   2. If the user token is unavailable (scope not yet granted, token
 *      expired, refresh failed), fall back to the service-account upload.
 *      → Files go to a shared company folder (GOOGLE_DRIVE_FOLDER_ID).
 *
 * Request body (JSON):
 *   - base64:    string  — base64-encoded image data (no data-URI prefix)
 *   - filename:  string  — desired filename, e.g. "banner-instagram-1234.png"
 *   - mimeType?: string  — defaults to "image/png"
 *
 * Successful response (200):
 *   { success: true, fileId, webViewLink, webContentLink, method }
 *
 * Error responses:
 *   401 — Unauthenticated
 *   400 — Missing required fields
 *   500 — Upload failure (with structured error + code)
 */
export async function POST(request: NextRequest) {
  // ── 1. Auth gate ─────────────────────────────────────────
  let authResult;
  try {
    authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
  } catch (authError) {
    console.error("[/api/export/drive] Auth guard threw:", authError);
    return NextResponse.json(
      {
        success: false,
        error: "Error de autenticación",
        detail:
          authError instanceof Error ? authError.message : String(authError),
        code: "auth_failed",
      },
      { status: 401 },
    );
  }

  try {
    // ── 2. Parse & validate request body ─────────────────────
    const body = await request.json();

    if (!body.base64 || !body.filename) {
      return NextResponse.json(
        {
          success: false,
          error: "Faltan campos requeridos: base64, filename",
          code: "bad_request",
        },
        { status: 400 },
      );
    }

    const { base64, filename, mimeType = "image/png" } = body;

    // Quick sanity check on payload size (base64 → ~1.33x raw)
    const estimatedSizeKB = (base64.length * 0.75) / 1024;
    console.log(
      `🔄 [/api/export/drive] User "${authResult.user.email}" exporting "${filename}" (~${estimatedSizeKB.toFixed(0)} KB)`,
    );

    const driveService = new GoogleDriveService();

    // ── 3. Try user's OAuth token first ──────────────────────
    let result = null;
    let uploadMethod: "user_token" | "service_account" = "user_token";

    try {
      const tokenResponse = await auth.api.getAccessToken({
        body: { providerId: "google" },
        headers: await headers(),
      });

      if (tokenResponse?.accessToken) {
        console.log(
          "🔑 [/api/export/drive] User access token obtained; uploading with user token",
        );
        result = await driveService.uploadWithUserToken(
          tokenResponse.accessToken,
          base64,
          filename,
          mimeType,
        );

        if (result.success) {
          console.log(
            `✅ [/api/export/drive] Uploaded "${filename}" to user's Drive: ${result.fileId}`,
          );
          return NextResponse.json({
            success: true,
            fileId: result.fileId,
            webViewLink: result.webViewLink,
            webContentLink: result.webContentLink,
            method: "user_token",
          });
        }

        // If user token failed due to scope or auth, log and fall through
        console.warn(
          `⚠️ [/api/export/drive] User-token upload failed (code=${result.code}): ${result.error}`,
        );
      } else {
        console.warn(
          "⚠️ [/api/export/drive] No user access token available; falling back to service account",
        );
      }
    } catch (tokenErr) {
      console.warn(
        "⚠️ [/api/export/drive] Could not get user access token:",
        tokenErr instanceof Error ? tokenErr.message : tokenErr,
      );
    }

    // ── 4. Fallback: service account ─────────────────────────
    uploadMethod = "service_account";

    console.log("🔄 [/api/export/drive] Attempting upload via service account");
    const saResult = await driveService.uploadWithServiceAccount(
      base64,
      filename,
      mimeType,
    );

    if (saResult.success) {
      console.log(
        `✅ [/api/export/drive] Uploaded "${filename}" via service account: ${saResult.fileId}`,
      );
      return NextResponse.json({
        success: true,
        fileId: saResult.fileId,
        webViewLink: saResult.webViewLink,
        webContentLink: saResult.webContentLink,
        method: uploadMethod,
      });
    }

    // ── 5. Both methods failed ───────────────────────────────
    // Return the most informative error. Prefer the user-token error
    // if it indicates a scope issue (actionable by the user).
    const preferredError = result?.code === "missing_scope" ? result : saResult;

    console.error(
      `❌ [/api/export/drive] All upload methods failed.`,
      `User-token: ${result?.error ?? "N/A"} (${result?.code ?? "N/A"})`,
      `Service-account: ${saResult.error} (${saResult.code})`,
    );

    return NextResponse.json(
      {
        success: false,
        error: preferredError.error || "Drive export failed",
        code: preferredError.code || "unknown",
        detail: {
          userTokenError: result?.error ?? "Token not available",
          serviceAccountError: saResult.error,
        },
      },
      { status: 500 },
    );
  } catch (error) {
    // ── 6. Catch-all ──────────────────────────────────────────
    console.error(
      "[/api/export/drive] Unhandled exception:",
      error instanceof Error
        ? { message: error.message, stack: error.stack }
        : error,
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Drive export failed",
        code: "unknown",
        detail: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    );
  }
}
