"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import type { SidebarPanelId } from "./types";
import type { GeneratedPostData } from "@/types/generated-post";
import type { BannerDimension } from "@/types/editor";
import { BANNER_DIMENSIONS } from "@/types/editor";
import type { Post } from "@/types/persistence";

import { CanvasProvider, useCanvasContext } from "./canvas-context";
import { TopToolbar } from "./top-toolbar";
import { IconRail } from "./icon-rail";
import { useAutosave } from "./use-autosave";
import { SidebarPanel } from "./sidebar-panel";
import { PropertiesPanel } from "./properties-panel";
import { InlinePropertiesPanel } from "./inline-properties-panel";
import { DriveFolderPicker } from "./drive-folder-picker";
import { authClient } from "@/lib/auth-client";

// Panels
import { GeneratePanel } from "./panels/generate-panel";
import { TemplatesPanel } from "./panels/templates-panel";
import { ConnectedElementsPanel } from "./panels/connected-elements-panel";
import { ConnectedTextPanel } from "./panels/connected-text-panel";
import { ConnectedMediaPanel } from "./panels/connected-media-panel";
import { ConnectedLayersPanel } from "./panels/connected-layers-panel";

// Export destination type
export type ExportDestination = "disk" | "drive";
// Share target type
export type ShareTarget =
  | "facebook"
  | "twitter"
  | "linkedin"
  | "whatsapp"
  | "email";

// Drive export destination: default folder (null) or picker-selected folder ID
export type DriveDestination = {
  targetFolderId: string | null;
};

// Lazy-load the interactive canvas (Konva-based)
const InteractiveCanvas = dynamic(
  () =>
    import("./interactive-canvas").then((mod) => ({
      default: mod.InteractiveCanvas,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="editor-canvas-spinner mx-auto" />
          <p className="mt-3 text-sm text-gray-400">Cargando editor...</p>
        </div>
      </div>
    ),
  },
);

function EditorContent({ postId }: { postId?: string }) {
  const {
    state,
    setCanvasSize,
    setBackgroundImage,
    selectedElement,
    selectElement,
    exportCanvasDataUrl,
    exportCanvasBlob,
  } = useCanvasContext();

  // ─── Autosave ────────────────────────────────────────────
  useAutosave({
    postId: postId ?? null,
    state,
    exportCanvasDataUrl,
    enabled: !!postId,
  });

  // ─── Post title (inline rename) ──────────────────────────
  const [postTitle, setPostTitle] = useState<string | undefined>(
    postId ? "" : undefined,
  );

  // Fetch initial title once when postId is present
  const titleFetched = useRef(false);
  useEffect(() => {
    if (!postId || titleFetched.current) return;
    titleFetched.current = true;
    fetch(`/api/posts/${postId}`)
      .then((r) => r.json())
      .then((data: { title?: string }) => {
        if (data.title) setPostTitle(data.title);
      })
      .catch(() => {});
  }, [postId]);

  const handlePostTitleChange = useCallback(
    async (newTitle: string) => {
      if (!postId) return;
      setPostTitle(newTitle);
      try {
        await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        });
      } catch {
        // silently fail — user sees change regardless
      }
    },
    [postId],
  );

  // Sidebar state
  const [activeSidebarPanel, setActiveSidebarPanel] =
    useState<SidebarPanelId | null>("generate");

  // Generation state
  const [generatedPost, setGeneratedPost] = useState<GeneratedPostData | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Canvas dimensions (for generate panel)
  const [selectedDimension, setSelectedDimension] = useState<BannerDimension>(
    BANNER_DIMENSIONS[0],
  );

  // Properties panels
  const [showGenerationResult, setShowGenerationResult] = useState(false);

  // Export/Share state
  const [isExporting, setIsExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // Drive folder picker state
  const [showDrivePicker, setShowDrivePicker] = useState(false);
  const [driveAccessToken, setDriveAccessToken] = useState<string | null>(null);

  // Handle sidebar panel toggle
  const handleSelectPanel = useCallback((panel: SidebarPanelId) => {
    setActiveSidebarPanel((current) => (current === panel ? null : panel));
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setActiveSidebarPanel(null);
  }, []);

  // Handle post generation — set background image on canvas
  const handlePostGenerated = useCallback(
    (post: GeneratedPostData) => {
      setGeneratedPost(post);
      setShowGenerationResult(true);

      // If the generation produced a banner image, set it as background
      if (post.banner?.dataUrl) {
        setBackgroundImage(post.banner.dataUrl);
      }

      // Update canvas size to match generated dimensions
      if (post.banner?.width && post.banner?.height) {
        setCanvasSize(post.banner.width, post.banner.height);
      }

      // Close the generate panel
      setActiveSidebarPanel(null);
    },
    [setBackgroundImage, setCanvasSize],
  );

  // Handle dimension change
  const handleDimensionChange = useCallback(
    (dim: BannerDimension) => {
      setSelectedDimension(dim);
      setCanvasSize(dim.width, dim.height);
    },
    [setCanvasSize],
  );

  // ─── Export: flatten all layers to PNG ───────────────────
  const handleExport = useCallback(
    async (destination: ExportDestination = "disk") => {
      setIsExporting(true);
      setExportMessage(null);

      try {
        if (destination === "disk") {
          // Use the Konva Stage export (flattens ALL layers)
          const dataUrl = exportCanvasDataUrl();
          if (!dataUrl) {
            setExportMessage("Error: No se pudo exportar el canvas.");
            return;
          }
          const link = document.createElement("a");
          link.href = dataUrl;
          link.download = `banner-${generatedPost?.platform || "post"}-${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setExportMessage("Banner descargado correctamente.");
        } else if (destination === "drive") {
          // Fetch user access token for the Picker API
          try {
            const tokenRes = await fetch("/api/export/drive/token");
            const tokenData = await tokenRes.json();
            if (tokenData.accessToken) {
              setDriveAccessToken(tokenData.accessToken);
            }
          } catch {
            // Token will be null — picker works without it (just no custom folder)
            setDriveAccessToken(null);
          }
          // Show the folder picker modal
          setShowDrivePicker(true);
          return; // Don't set isExporting to false yet
        }
      } catch (err) {
        setExportMessage(
          `Error: ${err instanceof Error ? err.message : "fallo inesperado"}`,
        );
      } finally {
        if (destination !== "drive") {
          setIsExporting(false);
          // Auto-clear message after 4s
          setTimeout(() => setExportMessage(null), 4000);
        }
      }
    },
    [exportCanvasDataUrl, generatedPost],
  );

  // ─── Drive upload with folder selection ──────────────────
  const handleDriveUpload = useCallback(
    async (targetFolderId: string | null) => {
      setShowDrivePicker(false);
      setIsExporting(true);
      setExportMessage(null);

      try {
        // Upload composited PNG blob to Google Drive via API
        const blob = await exportCanvasBlob();
        if (!blob) {
          setExportMessage("Error: No se pudo exportar el canvas.");
          return;
        }

        // Convert blob to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            // Strip the data:...;base64, prefix
            resolve(result.split(",")[1]);
          };
          reader.onerror = () => reject(new Error("Read failed"));
          reader.readAsDataURL(blob);
        });

        const filename = `banner-${generatedPost?.platform || "post"}-${Date.now()}.png`;

        const res = await fetch("/api/export/drive", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            filename,
            mimeType: "image/png",
            ...(targetFolderId ? { targetFolderId } : {}),
          }),
        });

        const data = await res.json();
        if (data.success) {
          setExportMessage(
            data.webViewLink
              ? `Guardado en Google Drive.`
              : "Guardado en Google Drive correctamente.",
          );
          if (data.webViewLink) {
            window.open(data.webViewLink, "_blank");
          }
        } else {
          // Handle structured error codes from the API
          if (data.code === "missing_scope") {
            setExportMessage(
              "Se necesitan permisos de Google Drive. Reconectando...",
            );
            // Trigger incremental scope grant via Better Auth linkSocial
            try {
              await authClient.linkSocial({
                provider: "google",
                scopes: ["https://www.googleapis.com/auth/drive.file"],
                callbackURL: window.location.href,
              });
            } catch {
              setExportMessage(
                "Error: Cierra sesión y vuelve a iniciar para conceder acceso a Drive.",
              );
            }
          } else {
            setExportMessage(
              `Error al subir a Drive: ${data.error || "desconocido"}`,
            );
          }
        }
      } catch (err) {
        setExportMessage(
          `Error: ${err instanceof Error ? err.message : "fallo inesperado"}`,
        );
      } finally {
        setIsExporting(false);
        setTimeout(() => setExportMessage(null), 4000);
      }
    },
    [exportCanvasBlob, generatedPost],
  );

  const handleDrivePickerCancel = useCallback(() => {
    setShowDrivePicker(false);
    setIsExporting(false);
  }, []);

  // ─── Share: upload to GCS then share URL ─────────────────
  const handleShare = useCallback(
    async (target: ShareTarget) => {
      setIsExporting(true);
      setExportMessage(null);

      try {
        const blob = await exportCanvasBlob();
        if (!blob) {
          setExportMessage("Error: No se pudo exportar el canvas.");
          return;
        }

        // Convert blob to base64
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(",")[1]);
          };
          reader.onerror = () => reject(new Error("Read failed"));
          reader.readAsDataURL(blob);
        });

        const filename = `share-${generatedPost?.platform || "post"}-${Date.now()}.png`;

        // Upload to public storage (GCS via existing upload route)
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64,
            filename,
            mimeType: "image/png",
            platform: generatedPost?.platform,
            width: state.canvasWidth,
            height: state.canvasHeight,
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadData.success || !uploadData.publicUrl) {
          setExportMessage("Error subiendo imagen para compartir.");
          return;
        }

        const url = encodeURIComponent(uploadData.publicUrl);
        const shareText = encodeURIComponent(
          generatedPost?.post?.content
            ? generatedPost.post.content.substring(0, 200)
            : "Mira este banner creado con Social Media Genius!",
        );

        const shareUrls: Record<ShareTarget, string> = {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
          twitter: `https://twitter.com/intent/tweet?url=${url}&text=${shareText}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
          whatsapp: `https://api.whatsapp.com/send?text=${shareText}%20${url}`,
          email: `mailto:?subject=${encodeURIComponent("Banner - Social Media Genius")}&body=${shareText}%0A%0A${url}`,
        };

        if (target === "email") {
          window.location.href = shareUrls.email;
        } else {
          window.open(shareUrls[target], "_blank", "noopener,noreferrer");
        }

        setExportMessage("Enlace de compartir abierto.");
      } catch (err) {
        setExportMessage(
          `Error: ${err instanceof Error ? err.message : "fallo inesperado"}`,
        );
      } finally {
        setIsExporting(false);
        setTimeout(() => setExportMessage(null), 4000);
      }
    },
    [exportCanvasBlob, generatedPost, state.canvasWidth, state.canvasHeight],
  );

  // Check if canvas has content (either generated or user-added elements)
  const hasCanvasContent =
    !!generatedPost?.banner?.dataUrl || state.elements.length > 0;

  // Panel content renderer
  const renderPanelContent = () => {
    switch (activeSidebarPanel) {
      case "generate":
        return (
          <GeneratePanel
            onPostGenerated={handlePostGenerated}
            selectedDimension={selectedDimension}
            onDimensionChange={handleDimensionChange}
            isGenerating={isGenerating}
            onGeneratingChange={setIsGenerating}
          />
        );
      case "templates":
        return (
          <TemplatesPanel
            selectedDimension={selectedDimension}
            onDimensionChange={handleDimensionChange}
          />
        );
      case "elements":
        return <ConnectedElementsPanel />;
      case "text":
        return <ConnectedTextPanel />;
      case "media":
        return <ConnectedMediaPanel />;
      case "layers":
        return <ConnectedLayersPanel />;
      default:
        return null;
    }
  };

  return (
    <div className="editor-viewport">
      {/* Drive folder picker modal */}
      {showDrivePicker && (
        <DriveFolderPicker
          accessToken={driveAccessToken}
          onConfirm={handleDriveUpload}
          onCancel={handleDrivePickerCancel}
          isUploading={isExporting}
        />
      )}

      {/* Top toolbar */}
      <TopToolbar
        selectedDimension={selectedDimension}
        hasGeneratedContent={hasCanvasContent}
        onExport={handleExport}
        onShare={handleShare}
        isExporting={isExporting}
        exportMessage={exportMessage}
        postTitle={postTitle}
        onPostTitleChange={handlePostTitleChange}
        showBackLink={!!postId}
      />

      {/* Main workspace area */}
      <div className="editor-workspace">
        {/* Left icon rail */}
        <IconRail
          activePanel={activeSidebarPanel}
          onSelectPanel={handleSelectPanel}
        />

        {/* Expandable sidebar panel */}
        {activeSidebarPanel && (
          <SidebarPanel
            activePanel={activeSidebarPanel}
            onClose={handleCloseSidebar}
          >
            {renderPanelContent()}
          </SidebarPanel>
        )}

        {/* Central interactive canvas (Konva) */}
        <InteractiveCanvas />

        {/* Right panel: element properties when selected, or generation results */}
        {selectedElement ? (
          <InlinePropertiesPanel onClose={() => selectElement(null)} />
        ) : showGenerationResult && generatedPost ? (
          <PropertiesPanel
            generatedPost={generatedPost}
            onClose={() => setShowGenerationResult(false)}
          />
        ) : null}
      </div>
    </div>
  );
}

export interface EditorLayoutProps {
  postId?: string;
  initialPost?: Post | null;
}

export function EditorLayout({ postId, initialPost }: EditorLayoutProps = {}) {
  const initialWidth = initialPost?.dimensions?.width ?? 1080;
  const initialHeight = initialPost?.dimensions?.height ?? 1080;

  return (
    <CanvasProvider
      initialWidth={initialWidth}
      initialHeight={initialHeight}
      initialCanvasState={initialPost?.canvas_state ?? null}
    >
      <EditorContent postId={postId} />
    </CanvasProvider>
  );
}
