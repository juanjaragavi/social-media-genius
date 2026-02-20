/**
 * Google Drive Service — Upload banners to Google Drive
 *
 * Two authentication modes:
 *
 * 1. **User OAuth token** (primary):
 *    The authenticated user's Google access token is obtained via
 *    Better Auth's `getAccessToken()` API. Files land in the *user's*
 *    Drive, which is the expected UX.
 *
 * 2. **Service account** (fallback):
 *    Uses GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY.
 *    Files land in the service account's Drive storage or in a
 *    shared folder (GOOGLE_DRIVE_FOLDER_ID). Used when user tokens
 *    are unavailable (e.g. scope not yet granted).
 *
 * Both modes use Google Drive API v3 multipart/related upload with
 * raw binary data (NOT base64-in-string, which is unreliable).
 */

import { GoogleAuth } from "google-auth-library";

// ── Types ────────────────────────────────────────────────────

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  error?: string;
  /** Machine-readable error code for client-side branching */
  code?:
    | "upload_ok"
    | "missing_scope"
    | "token_expired"
    | "auth_failed"
    | "drive_api_error"
    | "unknown";
}

// ── Shared helper: multipart/related upload ──────────────────

const DRIVE_UPLOAD_URL =
  "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink";

/**
 * Build a multipart/related body as a single Buffer that carries
 * raw binary data (not base64-encoded text).
 *
 * Google Drive API v3 expects:
 *   Part 1 — application/json metadata
 *   Part 2 — raw file bytes with the correct Content-Type
 */
function buildMultipartBody(
  metadata: Record<string, unknown>,
  fileBuffer: Buffer,
  mimeType: string,
  boundary: string,
): Buffer {
  const header =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${mimeType}\r\n\r\n`;
  const footer = `\r\n--${boundary}--`;

  return Buffer.concat([
    Buffer.from(header, "utf-8"),
    fileBuffer,
    Buffer.from(footer, "utf-8"),
  ]);
}

/**
 * Execute the multipart upload and return a structured result.
 */
async function executeUpload(
  accessToken: string,
  metadata: Record<string, unknown>,
  fileBuffer: Buffer,
  mimeType: string,
): Promise<DriveUploadResult> {
  const boundary = `smg_drive_${Date.now()}`;
  const body = buildMultipartBody(metadata, fileBuffer, mimeType, boundary);

  const response = await fetch(DRIVE_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": `multipart/related; boundary=${boundary}`,
      "Content-Length": String(body.length),
    },
    // Convert Buffer → Uint8Array for fetch() type compatibility
    body: new Uint8Array(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `❌ [Drive API] Upload failed (HTTP ${response.status}):`,
      errorBody,
    );

    // Detect permission / scope errors
    if (response.status === 401) {
      return {
        success: false,
        error: "Google access token expired or revoked",
        code: "token_expired",
      };
    }
    if (response.status === 403) {
      // Could be missing drive.file scope or Drive API not enabled
      const isScopeError =
        errorBody.includes("insufficientPermissions") ||
        errorBody.includes("drive.file");
      return {
        success: false,
        error: isScopeError
          ? "Missing Google Drive permissions. Please sign out and sign in again to grant Drive access."
          : `Drive API returned 403: ${errorBody}`,
        code: isScopeError ? "missing_scope" : "drive_api_error",
      };
    }

    return {
      success: false,
      error: `Drive API error ${response.status}: ${errorBody}`,
      code: "drive_api_error",
    };
  }

  const result = await response.json();

  return {
    success: true,
    fileId: result.id,
    webViewLink: result.webViewLink,
    webContentLink: result.webContentLink,
    code: "upload_ok",
  };
}

// ── Public API ───────────────────────────────────────────────

export class GoogleDriveService {
  private auth: GoogleAuth | null = null;
  private folderId: string | undefined;

  constructor() {
    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    // Service account credentials are optional — only used for fallback
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (email && privateKey) {
      this.auth = new GoogleAuth({
        credentials: {
          client_email: email,
          private_key: privateKey,
        },
        scopes: ["https://www.googleapis.com/auth/drive.file"],
      });
    }
  }

  // ── Upload with user's own OAuth access token ────────────

  /**
   * Upload a banner to the *user's* Google Drive using their OAuth
   * access token (obtained from Better Auth's account table).
   *
   * Files go to the user's root Drive folder (or GOOGLE_DRIVE_FOLDER_ID
   * if set, though that only works if the folder is accessible to the user).
   */
  async uploadWithUserToken(
    userAccessToken: string,
    base64Data: string,
    filename: string,
    mimeType: string = "image/png",
  ): Promise<DriveUploadResult> {
    try {
      const buffer = Buffer.from(base64Data, "base64");

      if (buffer.length === 0) {
        return {
          success: false,
          error: "Empty image data",
          code: "unknown",
        };
      }

      const metadata: Record<string, unknown> = {
        name: filename,
        mimeType,
      };

      console.log(
        `🔄 [Drive] Uploading ${filename} (${(buffer.length / 1024).toFixed(1)} KB) with user token`,
      );

      return await executeUpload(userAccessToken, metadata, buffer, mimeType);
    } catch (err) {
      console.error("❌ [Drive] User-token upload threw:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Drive upload failed",
        code: "unknown",
      };
    }
  }

  // ── Upload with service account (fallback) ───────────────

  /**
   * Upload a banner using the service account credentials.
   * Files go to the service account's Drive or a shared folder.
   */
  async uploadWithServiceAccount(
    base64Data: string,
    filename: string,
    mimeType: string = "image/png",
  ): Promise<DriveUploadResult> {
    if (!this.auth) {
      return {
        success: false,
        error:
          "Service account credentials not configured (GOOGLE_SERVICE_ACCOUNT_EMAIL / GOOGLE_PRIVATE_KEY)",
        code: "auth_failed",
      };
    }

    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      if (!accessToken.token) {
        return {
          success: false,
          error: "Failed to obtain service-account access token",
          code: "auth_failed",
        };
      }

      const buffer = Buffer.from(base64Data, "base64");

      if (buffer.length === 0) {
        return {
          success: false,
          error: "Empty image data",
          code: "unknown",
        };
      }

      const metadata: Record<string, unknown> = {
        name: filename,
        mimeType,
        ...(this.folderId ? { parents: [this.folderId] } : {}),
      };

      console.log(
        `🔄 [Drive] Uploading ${filename} (${(buffer.length / 1024).toFixed(1)} KB) with service account`,
      );

      return await executeUpload(accessToken.token, metadata, buffer, mimeType);
    } catch (err) {
      console.error("❌ [Drive] Service-account upload threw:", err);
      return {
        success: false,
        error: err instanceof Error ? err.message : "Drive upload failed",
        code: "unknown",
      };
    }
  }

  // ── Legacy API (delegates to service account) ────────────

  /**
   * @deprecated Use `uploadWithUserToken()` or `uploadWithServiceAccount()`.
   */
  async uploadBanner(
    base64Data: string,
    filename: string,
    mimeType: string = "image/png",
  ): Promise<DriveUploadResult> {
    return this.uploadWithServiceAccount(base64Data, filename, mimeType);
  }

  // ── Health check ─────────────────────────────────────────

  async healthCheck(): Promise<{
    configured: boolean;
    hasFolderId: boolean;
    error?: string;
  }> {
    if (!this.auth) {
      return {
        configured: false,
        hasFolderId: !!this.folderId,
        error: "Service account credentials not configured",
      };
    }

    try {
      const client = await this.auth.getClient();
      const token = await client.getAccessToken();

      return {
        configured: !!token.token,
        hasFolderId: !!this.folderId,
      };
    } catch (err) {
      return {
        configured: false,
        hasFolderId: !!this.folderId,
        error: err instanceof Error ? err.message : "Unknown error",
      };
    }
  }
}
