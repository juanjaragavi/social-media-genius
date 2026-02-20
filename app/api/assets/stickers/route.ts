import { NextRequest, NextResponse } from "next/server";

const ICONIFY_API = "https://api.iconify.design";

/**
 * GET /api/assets/stickers?query=<term>&limit=30
 *
 * Proxies search requests to the Iconify API (free, no key required).
 * Returns SVG icon URLs that can be placed as image layers on the canvas.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "star";
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  try {
    // Search Iconify for icons matching the query
    const searchUrl = `${ICONIFY_API}/search?query=${encodeURIComponent(query)}&limit=${limit}`;

    const res = await fetch(searchUrl, {
      next: { revalidate: 600 }, // Cache 10 minutes
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("❌ Iconify search error:", res.status, errorText);
      return NextResponse.json(
        { error: `Iconify API error: ${res.status}`, results: [] },
        { status: res.status },
      );
    }

    const data = await res.json();

    // Iconify returns { icons: ["prefix:name", ...], total: N }
    const icons: string[] = data.icons || [];

    const results = icons.map((icon: string) => {
      const [prefix, name] = icon.includes(":")
        ? icon.split(":")
        : icon.includes("/")
          ? icon.split("/")
          : ["mdi", icon];

      return {
        id: icon,
        name: name || icon,
        prefix: prefix || "mdi",
        // Direct SVG URL from Iconify CDN
        svgUrl: `https://api.iconify.design/${prefix}/${name}.svg?width=200&height=200`,
        // Preview URL (smaller)
        previewUrl: `https://api.iconify.design/${prefix}/${name}.svg?width=48&height=48`,
      };
    });

    return NextResponse.json({
      results,
      total: data.total || results.length,
    });
  } catch (error) {
    console.error("❌ Stickers proxy error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch stickers",
        results: [],
      },
      { status: 500 },
    );
  }
}
