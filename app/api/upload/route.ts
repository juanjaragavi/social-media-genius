import { NextRequest, NextResponse } from "next/server";
import { SupabaseService } from "@/lib/services/supabase-service";
import { requireAuth } from "@/lib/auth-guard";

export async function POST(request: NextRequest) {
  // ── Auth Gate ──────────────────────────────────────────
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  // ──────────────────────────────────────────────────────────

  try {
    const body = await request.json();

    if (!body.base64 || !body.filename) {
      return NextResponse.json(
        { error: "Missing required fields: base64, filename" },
        { status: 400 },
      );
    }

    const supabase = new SupabaseService();

    const result = await supabase.uploadBanner(
      body.base64,
      body.filename,
      body.mimeType || "image/png",
      {
        platform: body.platform,
        width: body.width,
        height: body.height,
        locale: body.locale,
      },
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Upload failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      path: result.path,
      publicUrl: result.publicUrl,
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  // ── Auth Gate ──────────────────────────────────────────
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  // ──────────────────────────────────────────────────────────

  try {
    const supabase = new SupabaseService();
    const banners = await supabase.listBanners();

    return NextResponse.json({ banners });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list banners",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  // ── Auth Gate ──────────────────────────────────────────
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  // ──────────────────────────────────────────────────────────

  try {
    const body = await request.json();

    if (!body.path) {
      return NextResponse.json(
        { error: "Missing required field: path" },
        { status: 400 },
      );
    }

    const supabase = new SupabaseService();
    const success = await supabase.deleteBanner(body.path);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to delete banner" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Delete failed",
      },
      { status: 500 },
    );
  }
}
