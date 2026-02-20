import { NextRequest, NextResponse } from "next/server";
import { EMOJI_CATEGORIES, searchEmojis } from "@/lib/data/emojis";

/**
 * GET /api/assets/emojis?query=<term>&category=<cat>
 *
 * Returns emojis from the static embedded dataset.
 * Supports search by name and category filtering.
 * No external API key required.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const category = searchParams.get("category") || "";

  try {
    if (query) {
      // Search across all emojis
      const results = searchEmojis(query);
      return NextResponse.json({ results, total: results.length });
    }

    if (category) {
      // Return emojis from a specific category
      const cat = EMOJI_CATEGORIES.find(
        (c) => c.name.toLowerCase() === category.toLowerCase(),
      );
      return NextResponse.json({
        results: cat?.emojis || [],
        total: cat?.emojis.length || 0,
      });
    }

    // Return all categories
    return NextResponse.json({
      categories: EMOJI_CATEGORIES.map((c) => ({
        name: c.name,
        count: c.emojis.length,
        preview: c.emojis.slice(0, 6).map((e) => e.emoji),
      })),
      results: EMOJI_CATEGORIES.flatMap((c) => c.emojis),
      total: EMOJI_CATEGORIES.reduce((sum, c) => sum + c.emojis.length, 0),
    });
  } catch (error) {
    console.error("❌ Emojis error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch emojis",
        results: [],
      },
      { status: 500 },
    );
  }
}
