"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import type { SidebarPanelId } from "./types";
import type { GeneratedPostData } from "@/types/generated-post";
import type { BannerDimension } from "@/types/editor";
import { BANNER_DIMENSIONS } from "@/types/editor";

import { TopToolbar } from "./top-toolbar";
import { IconRail } from "./icon-rail";
import { SidebarPanel } from "./sidebar-panel";
import { CanvasArea } from "./canvas-area";
import { PropertiesPanel } from "./properties-panel";

// Panels
import { GeneratePanel } from "./panels/generate-panel";
import { TemplatesPanel } from "./panels/templates-panel";
import { ElementsPanel } from "./panels/elements-panel";
import { TextPanel } from "./panels/text-panel";
import { MediaPanel } from "./panels/media-panel";
import { LayersPanel } from "./panels/layers-panel";

// Lazy-load the heavy BannerEditor (Konva) only when needed
const BannerEditor = dynamic(
  () =>
    import("@/components/banner-editor/banner-editor").then(
      (mod) => mod.BannerEditor,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="editor-canvas-spinner mx-auto" />
          <p className="mt-3 text-sm text-gray-400">Cargando editor...</p>
        </div>
      </div>
    ),
  },
);

export function EditorLayout() {
  // Sidebar state
  const [activeSidebarPanel, setActiveSidebarPanel] =
    useState<SidebarPanelId | null>("generate");

  // Generation state
  const [generatedPost, setGeneratedPost] = useState<GeneratedPostData | null>(
    null,
  );
  const [isGenerating, setIsGenerating] = useState(false);

  // Canvas dimensions
  const [selectedDimension, setSelectedDimension] = useState<BannerDimension>(
    BANNER_DIMENSIONS[0],
  );
  const [canvasZoom, setCanvasZoom] = useState(100);

  // Properties panel (results)
  const [showProperties, setShowProperties] = useState(false);

  // Konva editor state
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorImage, setEditorImage] = useState<string | undefined>(undefined);
  const [editorWidth, setEditorWidth] = useState(1080);
  const [editorHeight, setEditorHeight] = useState(1080);

  // Handle sidebar panel toggle
  const handleSelectPanel = useCallback((panel: SidebarPanelId) => {
    setActiveSidebarPanel((current) => (current === panel ? null : panel));
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setActiveSidebarPanel(null);
  }, []);

  // Handle post generation
  const handlePostGenerated = useCallback((post: GeneratedPostData) => {
    setGeneratedPost(post);
    setShowProperties(true);
    // Close generate panel, open properties
    setActiveSidebarPanel(null);
  }, []);

  // Handle dimension change
  const handleDimensionChange = useCallback((dim: BannerDimension) => {
    setSelectedDimension(dim);
  }, []);

  // Handle opening the Konva editor
  const handleOpenEditor = useCallback(
    (imageDataUrl?: string, width?: number, height?: number) => {
      setEditorImage(imageDataUrl);
      setEditorWidth(width || generatedPost?.banner?.width || 1080);
      setEditorHeight(height || generatedPost?.banner?.height || 1080);
      setEditorOpen(true);
    },
    [generatedPost],
  );

  // Handle saving from the Konva editor
  const handleEditorSave = useCallback(
    (exportedDataUrl: string) => {
      if (generatedPost) {
        setGeneratedPost({
          ...generatedPost,
          banner: {
            ...generatedPost.banner,
            dataUrl: exportedDataUrl,
          },
        });
      }
      setEditorOpen(false);
    },
    [generatedPost],
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

  // Render the active panel content
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
        return <ElementsPanel />;
      case "text":
        return <TextPanel />;
      case "media":
        return <MediaPanel />;
      case "layers":
        return <LayersPanel />;
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

        {/* Central canvas area */}
        <CanvasArea
          generatedPost={generatedPost}
          selectedDimension={selectedDimension}
          zoom={canvasZoom}
          onZoomChange={setCanvasZoom}
          isGenerating={isGenerating}
        />

        {/* Right properties panel */}
        {showProperties && generatedPost && (
          <PropertiesPanel
            generatedPost={generatedPost}
            onOpenEditor={handleOpenEditor}
            onClose={() => setShowProperties(false)}
          />
        )}
      </div>

      {/* Konva Banner Editor Modal */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
          <div className="w-full h-full bg-white relative flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">
                Editor de Banner
              </h2>
              <button
                onClick={() => setEditorOpen(false)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
                title="Cerrar editor"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <BannerEditor
                initialImage={editorImage}
                canvasWidth={editorWidth}
                canvasHeight={editorHeight}
                onExport={handleEditorSave}
                onClose={() => setEditorOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
