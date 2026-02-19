/**
 * Google Drive Service - Save banners directly to Google Drive
 *
 * Requires:
 *   - GOOGLE_CLOUD_PROJECT
 *   - GOOGLE_SERVICE_ACCOUNT_EMAIL
 *   - GOOGLE_PRIVATE_KEY
 *   - GOOGLE_DRIVE_FOLDER_ID (optional - target folder)
 *
 * The service account must have access to the target Drive folder.
 * Share the folder with the service account email to grant access.
 */

import { GoogleAuth } from "google-auth-library";

interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  webViewLink?: string;
  webContentLink?: string;
  error?: string;
}

export class GoogleDriveService {
  private auth: GoogleAuth;
  private folderId: string | undefined;

  constructor() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

    if (!email || !privateKey) {
      throw new Error(
        "Missing Google service account credentials for Drive API",
      );
    }

    this.auth = new GoogleAuth({
      credentials: {
        client_email: email,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });

    this.folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  }

  /**
   * Upload a banner image to Google Drive
   */
  async uploadBanner(
    base64Data: string,
    filename: string,
    mimeType: string = "image/png",
  ): Promise<DriveUploadResult> {
    try {
      const client = await this.auth.getClient();
      const accessToken = await client.getAccessToken();

      if (!accessToken.token) {
        return { success: false, error: "Failed to get access token" };
      }

      // Create multipart upload
      const metadata = {
        name: filename,
        mimeType,
        ...(this.folderId ? { parents: [this.folderId] } : {}),
      };

      const buffer = Buffer.from(base64Data, "base64");
      const boundary = "banner_upload_boundary";

      const multipartBody =
        `--${boundary}\r\n` +
        `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
        `${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\n` +
        `Content-Type: ${mimeType}\r\n` +
        `Content-Transfer-Encoding: base64\r\n\r\n` +
        `${buffer.toString("base64")}\r\n` +
        `--${boundary}--`;

      const response = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken.token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`,
          },
          body: multipartBody,
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Drive API error ${response.status}: ${errorText}`,
        };
      }

      const result = await response.json();

      return {
        success: true,
        fileId: result.id,
        webViewLink: result.webViewLink,
        webContentLink: result.webContentLink,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Drive upload failed",
      };
    }
  }

  /**
   * Health check - verify Drive API access
   */
  async healthCheck(): Promise<{
    configured: boolean;
    hasFolderId: boolean;
    error?: string;
  }> {
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
