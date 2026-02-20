"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { SidebarPanelId } from "./types";
import type { GeneratedPostData } from "@/types/generated-post";
import type { BannerDimension } from "@/types/editor";
import { BANNER_DIMENSIONS } from "@/types/editor";

import { CanvasProvider, useCanvasContext } from "./canvas-context";
import { TopToolbar } from "./top-toolbar";
import { IconRail } from "./icon-rail";
import { SidebarPanel } from "./sidebar-panel";
import { PropertiesPanel } from "./properties-panel";
import { InlinePropertiesPanel } from "./inline-properties-panel";

// Panels
import { GeneratePanel } from "./panels/generate-panel";
import { TemplatesPanel } from "./panels/templates-panel";
import { ConnectedElementsPanel } from "./panels/connected-elements-panel";
import { ConnectedTextPanel } from "./panels/connected-text-panel";
import { ConnectedMediaPanel } from "./panels/connected-media-panel";
import { ConnectedLayersPanel } from "./panels/connected-layers-panel";

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

function EditorContent() {
  const { setCanvasSize, setBackgroundImage, selectedElement } =
    useCanvasContext();

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

  // Handle export
  const handleExport = useCallback(() => {
    if (generatedPost?.banner?.dataUrl) {
      const link = document.createElement("a");
      link.href = generatedPost.banner.dataUrl;
      link.download = `banner-${generatedPost.platform || "post"}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generatedPost]);

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
      {/* Top toolbar */}
      <TopToolbar
        selectedDimension={selectedDimension}
        hasGeneratedContent={!!generatedPost?.banner?.dataUrl}
        onExport={handleExport}
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
          <InlinePropertiesPanel
            onClose={() => {
              /* keep panel visible while element selected */
            }}
          />
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

export function EditorLayout() {
  return (
    <CanvasProvider>
      <EditorContent />
    </CanvasProvider>
  );
}
