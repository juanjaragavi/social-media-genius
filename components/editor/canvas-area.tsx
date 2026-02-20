"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import type { GeneratedPostData } from "@/types/generated-post";
import type { BannerDimension } from "@/types/editor";

interface CanvasAreaProps {
  generatedPost: GeneratedPostData | null;
  selectedDimension: BannerDimension;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  isGenerating: boolean;
}

export function CanvasArea({
  generatedPost,
  selectedDimension,
  zoom,
  onZoomChange,
  isGenerating,
}: CanvasAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Measure available space
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ width: rect.width, height: rect.height });
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate canvas display scale to fit within the container
  const canvasWidth = selectedDimension.width;
  const canvasHeight = selectedDimension.height;

  const padding = 60; // px padding around canvas
  const availableWidth = containerSize.width - padding * 2;
  const availableHeight = containerSize.height - padding * 2;

  const fitScale =
    availableWidth > 0 && availableHeight > 0
      ? Math.min(
          availableWidth / canvasWidth,
          availableHeight / canvasHeight,
          1, // Don't upscale beyond 100%
        )
      : 0.3;

  const displayScale = fitScale * (zoom / 100);
  const displayWidth = canvasWidth * displayScale;
  const displayHeight = canvasHeight * displayScale;

  const handleZoomIn = useCallback(() => {
    onZoomChange(Math.min(zoom + 10, 200));
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange(Math.max(zoom - 10, 20));
  }, [zoom, onZoomChange]);

  const handleFitToScreen = useCallback(() => {
    onZoomChange(100);
  }, [onZoomChange]);

  // Handle mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        onZoomChange(Math.max(20, Math.min(200, zoom + delta)));
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [zoom, onZoomChange]);

  return (
    <div className="editor-canvas-area" ref={containerRef}>
      {/* Canvas workspace with checkerboard background */}
      <div className="editor-canvas-workspace">
        {/* The canvas frame */}
        <div
          className="editor-canvas-frame"
          style={{
            width: displayWidth,
            height: displayHeight,
          }}
        >
          {/* Loading overlay */}
          {isGenerating && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-sm">
              <div className="editor-canvas-spinner" />
              <p className="mt-3 text-sm text-gray-500 font-medium">
                Generando banner...
              </p>
            </div>
          )}

          {/* Canvas content */}
          {generatedPost?.banner?.dataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={generatedPost.banner.dataUrl}
              alt="Banner generado"
              className="w-full h-full object-contain"
              draggable={false}
            />
          ) : !isGenerating ? (
            <div className="editor-canvas-empty">
              <div className="relative mb-4">
                <Image
                  src="https://storage.googleapis.com/media-topfinanzas-com/favicon.png"
                  alt="TopNetworks"
                  width={80}
                  height={80}
                  className="opacity-15 grayscale select-none pointer-events-none"
                  draggable={false}
                />
              </div>
              <p className="text-sm text-gray-400 font-medium">
                Tu banner aparecerá aquí
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {canvasWidth}×{canvasHeight} px
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="editor-zoom-controls">
        <button
          onClick={handleZoomOut}
          className="editor-zoom-btn"
          title="Alejar"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <span className="text-xs font-medium text-gray-600 min-w-12 text-center tabular-nums">
          {Math.round(zoom)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="editor-zoom-btn"
          title="Acercar"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <div className="w-px h-4 bg-gray-200" />
        <button
          onClick={handleFitToScreen}
          className="editor-zoom-btn"
          title="Ajustar a pantalla"
        >
          <Maximize2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
