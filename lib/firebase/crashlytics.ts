/**
 * Firebase Analytics integration for client-side error and event reporting.
 * Captures unhandled exceptions and custom error events.
 *
 * Usage:
 *   import { logError, logCustomEvent } from "@/lib/firebase/crashlytics";
 *   logError(new Error("Something failed"));
 *   logCustomEvent("banner_generated", { platform: "instagram" });
 *
 * @module lib/firebase/crashlytics
 */

"use client";

import { getFirebaseApp } from "./config";

let analyticsInstance: ReturnType<
  typeof import("firebase/analytics").getAnalytics
> | null = null;

async function getAnalytics() {
  if (typeof window === "undefined") return null;

  const app = getFirebaseApp();
  if (!app) return null;

  if (!analyticsInstance) {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    const supported = await isSupported();
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }

  return analyticsInstance;
}

/**
 * Log an error to Firebase Analytics (Crashlytics web equivalent).
 * Firebase Crashlytics for web uses Analytics events under the hood.
 */
export async function logError(
  error: Error,
  context?: Record<string, string>,
): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) return;

    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, "exception", {
      description: error.message,
      fatal: false,
      ...context,
    });
  } catch {
    // Silently fail — monitoring should never break the app
    console.warn("[SocialMediaGenius] Firebase error logging failed");
  }
}

/**
 * Log a custom event to Firebase Analytics.
 */
export async function logCustomEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>,
): Promise<void> {
  try {
    const analytics = await getAnalytics();
    if (!analytics) return;

    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, eventName, params);
  } catch {
    console.warn("[SocialMediaGenius] Firebase event logging failed");
  }
}
