import { NextRequest, NextResponse } from "next/server";

const UNSPLASH_BASE = "https://api.unsplash.com";

/**
 * GET /api/assets/photos?query=<term>&page=1&per_page=20
 *
 * Proxies search requests to the Unsplash API.
 * Requires UNSPLASH_ACCESS_KEY environment variable.
 */
export async function GET(request: NextRequest) {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      {
        error: "UNSPLASH_ACCESS_KEY no configurado",
        results: [],
        total: 0,
      },
      { status: 503 },
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "social media";
  const page = searchParams.get("page") || "1";
  const perPage = searchParams.get("per_page") || "20";

  try {
    const url = `${UNSPLASH_BASE}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=squarish`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
      next: { revalidate: 300 }, // Cache 5 minutes
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Unsplash API error:", res.status, errorText);
      return NextResponse.json(
        { error: `Unsplash API error: ${res.status}`, results: [], total: 0 },
        { status: res.status },
      );
    }

    const data = await res.json();

    // Map to minimal shape for the client
    const results = data.results.map(
      (photo: {
        id: string;
        urls: { small: string; regular: string; thumb: string };
        alt_description: string | null;
        description: string | null;
        user: { name: string; links: { html: string } };
        width: number;
        height: number;
      }) => ({
        id: photo.id,
        thumb: photo.urls.thumb,
        small: photo.urls.small,
        regular: photo.urls.regular,
        alt: photo.alt_description || photo.description || "Unsplash Photo",
        author: photo.user.name,
        authorUrl: photo.user.links.html,
        width: photo.width,
        height: photo.height,
      }),
    );

    return NextResponse.json({
      results,
      total: data.total,
      totalPages: data.total_pages,
    });
  } catch (error) {
    console.error("❌ Photos proxy error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch photos",
        results: [],
        total: 0,
      },
      { status: 500 },
    );
  }
}
