/**
 * Temporary diagnostic: directly call the sign-in/social endpoint
 * and return the raw response. DELETE after debugging.
 *
 * Visit: https://social-media-genius.vercel.app/api/auth-test
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const host = req.headers.get("host") || "social-media-genius.vercel.app";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseURL = `${protocol}://${host}`;

  const results: Record<string, unknown> = { baseURL };

  // Test 1: POST /api/auth/sign-in/social with google provider
  try {
    const signInURL = `${baseURL}/api/auth/sign-in/social`;
    results.signInURL = signInURL;

    const response = await fetch(signInURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseURL,
        Referer: `${baseURL}/login`,
      },
      body: JSON.stringify({
        provider: "google",
        callbackURL: "/",
      }),
      redirect: "manual", // Don't follow redirects
    });

    results.signInStatus = response.status;
    results.signInStatusText = response.statusText;
    results.signInHeaders = Object.fromEntries(response.headers.entries());

    // Read the body
    const text = await response.text();
    try {
      results.signInBody = JSON.parse(text);
    } catch {
      results.signInBody = text.slice(0, 2000);
    }
  } catch (err: unknown) {
    results.signInError = {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack?.split("\n").slice(0, 5) : undefined,
    };
  }

  // Test 2: GET /api/auth/ok - Better Auth health check
  try {
    const okResponse = await fetch(`${baseURL}/api/auth/ok`);
    results.healthStatus = okResponse.status;
    const okText = await okResponse.text();
    try {
      results.healthBody = JSON.parse(okText);
    } catch {
      results.healthBody = okText.slice(0, 500);
    }
  } catch (err: unknown) {
    results.healthError = err instanceof Error ? err.message : String(err);
  }

  return NextResponse.json(results, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
