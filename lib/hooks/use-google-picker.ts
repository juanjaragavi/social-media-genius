/**
 * useGooglePicker — React hook for loading and opening the Google Picker API
 *
 * Pattern adapted from route-genius/lib/use-google-picker.ts.
 * Opens a folder-only picker that lets the user browse their Google Drive
 * and select a destination folder for banner uploads.
 *
 * Requirements:
 *   - NEXT_PUBLIC_GOOGLE_API_KEY env var (browser API key)
 *   - Google Picker API enabled in the Cloud Console
 *   - User must have an active access token with drive.file scope
 */

"use client";

import { useRef, useCallback, useEffect, useState } from "react";

const PICKER_SCRIPT_URL = "https://apis.google.com/js/api.js";

interface UseGooglePickerOptions {
  /** User's OAuth access token (drive.file scope) */
  accessToken: string | null;
  /** Called when the user picks a folder */
  onFolderSelected: (folderId: string, folderName: string) => void;
  /** Called if the user cancels the picker */
  onCancel?: () => void;
}

export function useGooglePicker({
  accessToken,
  onFolderSelected,
  onCancel,
}: UseGooglePickerOptions) {
  const pickerLoaded = useRef(false);
  const scriptLoaded = useRef(false);
  const [isReady, setIsReady] = useState(false);

  // Load the gapi script once
  useEffect(() => {
    if (scriptLoaded.current) return;
    if (typeof window === "undefined") return;

    // Check if already loaded
    if (window.gapi) {
      scriptLoaded.current = true;
      window.gapi.load("picker", () => {
        pickerLoaded.current = true;
        setIsReady(true);
      });
      return;
    }

    const script = document.createElement("script");
    script.src = PICKER_SCRIPT_URL;
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
      window.gapi.load("picker", () => {
        pickerLoaded.current = true;
        setIsReady(true);
      });
    };
    document.body.appendChild(script);

    return () => {
      // Script stays loaded — no cleanup needed
    };
  }, []);

  const openPickerRef = useRef<() => void>(() => {});

  const openPicker = useCallback(() => {
    if (!pickerLoaded.current || !window.google?.picker) {
      console.warn(
        "⚠️ [useGooglePicker] Picker API not loaded yet. Retrying in 500ms...",
      );
      // Retry once after a short delay
      setTimeout(() => {
        if (pickerLoaded.current && window.google?.picker) {
          openPickerRef.current();
        } else {
          console.error("❌ [useGooglePicker] Picker API failed to load.");
        }
      }, 500);
      return;
    }

    if (!accessToken) {
      console.error("❌ [useGooglePicker] No access token available.");
      return;
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PICKER_API_KEY;
    if (!apiKey) {
      console.error(
        "❌ [useGooglePicker] NEXT_PUBLIC_GOOGLE_PICKER_API_KEY is not set.",
      );
      return;
    }

    const docsView = new window.google.picker.DocsView()
      .setIncludeFolders(true)
      .setSelectFolderEnabled(true)
      .setMimeTypes("application/vnd.google-apps.folder");

    const picker = new window.google.picker.PickerBuilder()
      .addView(docsView)
      .setOAuthToken(accessToken)
      .setDeveloperKey(apiKey)
      .setTitle("Seleccionar carpeta de destino")
      .setCallback((data: google.picker.ResponseObject) => {
        if (data.action === google.picker.Action.PICKED && data.docs?.[0]) {
          const folder = data.docs[0];
          onFolderSelected(folder.id, folder.name);
        } else if (data.action === google.picker.Action.CANCEL) {
          onCancel?.();
        }
      })
      .build();

    picker.setVisible(true);
  }, [accessToken, onFolderSelected, onCancel]);

  // Keep ref in sync for retry callback
  useEffect(() => {
    openPickerRef.current = openPicker;
  }, [openPicker]);

  return { openPicker, isReady };
}
