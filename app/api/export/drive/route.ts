import { NextRequest, NextResponse } from "next/server";
import { GoogleDriveService } from "@/lib/services/google-drive-service";

/**
 * POST /api/export/drive
 * Upload a composited banner PNG to Google Drive via service account.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.base64 || !body.filename) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: base64, filename" },
        { status: 400 },
      );
    }

    const driveService = new GoogleDriveService();

    const result = await driveService.uploadBanner(
      body.base64,
      body.filename,
      body.mimeType || "image/png",
    );

    if (!result.success) {
      console.error("❌ Google Drive upload error:", result.error);
      return NextResponse.json(
        { success: false, error: result.error || "Upload to Drive failed" },
        { status: 500 },
      );
    }

    console.log("✅ Banner uploaded to Google Drive:", result.fileId);

    return NextResponse.json({
      success: true,
      fileId: result.fileId,
      webViewLink: result.webViewLink,
      webContentLink: result.webContentLink,
    });
  } catch (error) {
    console.error("❌ Drive export error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Drive export failed",
      },
      { status: 500 },
    );
  }
}
