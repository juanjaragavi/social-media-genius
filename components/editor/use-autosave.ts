"use client";

/**
 * useAutosave — Debounced autosave hook for canvas state persistence
 *
 * Saves canvas_state to Supabase on every meaningful mutation (debounced 500ms),
 * generates thumbnails periodically (every 5s), and persists final state
 * on beforeunload using sendBeacon.
 */

import { useEffect, useRef, useCallback } from "react";
import type { EditorState } from "@/types/editor";
import type { CanvasState } from "@/types/persistence";

interface UseAutosaveOptions {
  postId: string | null;
  state: EditorState;
  exportCanvasDataUrl: () => string | null;
  enabled?: boolean;
}

/** Extract the CanvasState from the EditorState for serialization */
function serializeState(state: EditorState): CanvasState {
  // Find the background image element
  const bgElement = state.elements.find(
    (el) => el.type === "image" && el.name === "Fondo",
  );
  const baseImageUrl =
    bgElement && "src" in bgElement ? (bgElement.src as string) : null;

  return {
    baseImageUrl,
    backgroundColor: state.backgroundColor,
    layers: state.elements,
  };
}

export function useAutosave({
  postId,
  state,
  exportCanvasDataUrl,
  enabled = true,
}: UseAutosaveOptions) {
  const lastSavedRef = useRef<string>("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbnailTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const postIdRef = useRef(postId);

  // Keep postId ref in sync
  useEffect(() => {
    postIdRef.current = postId;
  }, [postId]);

  // ─── Save canvas_state (debounced 500ms) ────────────────

  const saveCanvasState = useCallback(async () => {
    const id = postIdRef.current;
    if (!id || !enabled) return;

    const canvasState = serializeState(state);
    const stateJson = JSON.stringify(canvasState);

    // Skip if nothing changed
    if (stateJson === lastSavedRef.current) return;
    lastSavedRef.current = stateJson;

    try {
      await fetch(`/api/posts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          canvas_state: canvasState,
          dimensions: {
            width: state.canvasWidth,
            height: state.canvasHeight,
          },
        }),
      });
    } catch (err) {
      console.warn("⚠️ Autosave failed:", err);
    }
  }, [state, enabled]);

  // Debounced save on state change
  useEffect(() => {
    if (!postId || !enabled) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(saveCanvasState, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    state.elements,
    state.backgroundColor,
    state.canvasWidth,
    state.canvasHeight,
    postId,
    enabled,
    saveCanvasState,
  ]);

  // ─── Thumbnail generation (debounced 5s) ────────────────

  const generateAndUploadThumbnail = useCallback(async () => {
    const id = postIdRef.current;
    if (!id || !enabled) return;

    try {
      const dataUrl = exportCanvasDataUrl();
      if (!dataUrl) return;

      // Create 400×400 thumbnail via offscreen canvas
      const img = new window.Image();
      img.crossOrigin = "anonymous";

      const base64 = await new Promise<string | null>((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 400;
          canvas.height = 400;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(null);
            return;
          }

          // Aspect-ratio-preserving fit
          const scale = Math.min(400 / img.width, 400 / img.height);
          const w = img.width * scale;
          const h = img.height * scale;
          const x = (400 - w) / 2;
          const y = (400 - h) / 2;

          ctx.fillStyle = "#f5f5f5";
          ctx.fillRect(0, 0, 400, 400);
          ctx.drawImage(img, x, y, w, h);

          // Export as JPEG
          const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.8);
          resolve(jpegDataUrl.split(",")[1]); // Strip data URL prefix
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
      });

      if (!base64) return;

      await fetch(`/api/posts/${id}/thumbnail`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64 }),
      });
    } catch (err) {
      console.warn("⚠️ Thumbnail upload failed:", err);
    }
  }, [exportCanvasDataUrl, enabled]);

  // Debounced thumbnail generation (5 seconds)
  useEffect(() => {
    if (!postId || !enabled) return;
    // Only generate thumbnails when there's content
    if (state.elements.length === 0) return;

    if (thumbnailTimerRef.current) clearTimeout(thumbnailTimerRef.current);
    thumbnailTimerRef.current = setTimeout(generateAndUploadThumbnail, 5000);

    return () => {
      if (thumbnailTimerRef.current) clearTimeout(thumbnailTimerRef.current);
    };
  }, [
    state.elements,
    state.backgroundColor,
    postId,
    enabled,
    generateAndUploadThumbnail,
  ]);

  // ─── beforeunload — final save via sendBeacon ───────────

  useEffect(() => {
    if (!postId || !enabled) return;

    const handleBeforeUnload = () => {
      const id = postIdRef.current;
      if (!id) return;

      const canvasState = serializeState(state);
      const blob = new Blob(
        [
          JSON.stringify({
            canvas_state: canvasState,
            dimensions: {
              width: state.canvasWidth,
              height: state.canvasHeight,
            },
          }),
        ],
        { type: "application/json" },
      );

      navigator.sendBeacon(`/api/posts/${id}/autosave`, blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [postId, state, enabled]);
}
