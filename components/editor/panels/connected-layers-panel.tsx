"use client";

import React, { useMemo, useCallback } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Image as ImageIcon,
  Type,
  Square,
  Stamp,
  Layers as LayersIcon,
} from "lucide-react";
import { useCanvasContext } from "../canvas-context";

function getLayerIcon(type: string) {
  switch (type) {
    case "image":
      return <ImageIcon className="h-3.5 w-3.5 text-blue-500" />;
    case "text":
      return <Type className="h-3.5 w-3.5 text-purple-500" />;
    case "shape":
      return <Square className="h-3.5 w-3.5 text-orange-500" />;
    case "watermark":
      return <Stamp className="h-3.5 w-3.5 text-gray-500" />;
    default:
      return <Square className="h-3.5 w-3.5 text-gray-400" />;
  }
}

/**
 * ConnectedLayersPanel maps the shared canvas context elements
 * to the layers panel UI, allowing selection, visibility toggle,
 * lock/unlock, and reordering.
 */
export function ConnectedLayersPanel() {
  const { state, selectElement, updateElement } = useCanvasContext();

  // We display layers from top (highest z-index) to bottom
  const layers = useMemo(
    () =>
      [...state.elements].reverse().map((el) => ({
        id: el.id,
        name: el.name,
        type: el.type as "image" | "text" | "shape" | "watermark",
        visible: el.visible,
        locked: el.locked,
        thumbnail:
          el.type === "image" ? (el as { src: string }).src : undefined,
      })),
    [state.elements],
  );

  const handleToggleVisibility = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id);
      if (el) updateElement(id, { visible: !el.visible });
    },
    [state.elements, updateElement],
  );

  const handleToggleLock = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id);
      if (el) updateElement(id, { locked: !el.locked });
    },
    [state.elements, updateElement],
  );

  if (layers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex border-b border-gray-200">
          <button className="flex-1 py-2 text-xs font-medium text-gray-400 border-b-2 border-transparent">
            Organizar
          </button>
          <button className="flex-1 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600">
            Capas
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <LayersIcon className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-xs text-gray-400 font-medium">Sin capas</p>
          <p className="text-[10px] text-gray-500 mt-1">
            Genera un banner o agrega elementos para comenzar
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Tab header */}
      <div className="flex border-b border-gray-200">
        <button className="flex-1 py-2 text-xs font-medium text-gray-400 border-b-2 border-transparent hover:text-gray-600">
          Organizar
        </button>
        <button className="flex-1 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600">
          Capas
        </button>
      </div>

      {/* Layer list */}
      <div className="space-y-0.5">
        {layers.map((layer) => {
          const isSelected = state.selectedElementId === layer.id;
          return (
            <div
              key={layer.id}
              className={`editor-layer-item ${isSelected ? "active" : ""}`}
              onClick={() => selectElement(layer.id)}
            >
              {/* Drag handle */}
              <div className="editor-layer-grip">
                <svg
                  className="h-3.5 w-3.5 text-gray-300"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <circle cx="5" cy="4" r="1.5" />
                  <circle cx="11" cy="4" r="1.5" />
                  <circle cx="5" cy="8" r="1.5" />
                  <circle cx="11" cy="8" r="1.5" />
                  <circle cx="5" cy="12" r="1.5" />
                  <circle cx="11" cy="12" r="1.5" />
                </svg>
              </div>

              {/* Thumbnail + Name */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {layer.thumbnail ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={layer.thumbnail}
                    alt={layer.name}
                    className="w-8 h-8 rounded object-cover border border-gray-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded bg-gray-100 border border-gray-200 flex items-center justify-center">
                    {getLayerIcon(layer.type)}
                  </div>
                )}
                <span className="text-xs text-gray-700 truncate">
                  {layer.name}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleVisibility(layer.id);
                  }}
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                  title={layer.visible ? "Ocultar" : "Mostrar"}
                >
                  {layer.visible ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLock(layer.id);
                  }}
                  className="p-0.5 rounded hover:bg-gray-200 text-gray-400"
                  title={layer.locked ? "Desbloquear" : "Bloquear"}
                >
                  {layer.locked ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Unlock className="h-3 w-3" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
