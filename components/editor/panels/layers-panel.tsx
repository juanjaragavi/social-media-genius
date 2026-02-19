"use client";

import React from "react";
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

interface Layer {
  id: string;
  name: string;
  type: "image" | "text" | "shape" | "watermark";
  visible: boolean;
  locked: boolean;
  thumbnail?: string;
}

interface LayersPanelProps {
  layers?: Layer[];
  selectedLayerId?: string | null;
  onSelectLayer?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onDeleteLayer?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

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

export function LayersPanel({
  layers = [],
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
}: LayersPanelProps) {
  if (layers.length === 0) {
    return (
      <div className="space-y-4">
        {/* Tab header like Canva */}
        <div className="flex border-b border-gray-200">
          <button className="flex-1 py-2 text-xs font-medium text-gray-400 border-b-2 border-transparent">
            Organizar
          </button>
          <button className="flex-1 py-2 text-xs font-medium text-blue-600 border-b-2 border-blue-600">
            Capas
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-8 text-center">
          <LayersIcon className="h-10 w-10 text-gray-200 mb-3" />
          <p className="text-xs text-gray-400 font-medium">Sin capas</p>
          <p className="text-[10px] text-gray-300 mt-1">
            Genera un banner para comenzar a editar capas
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
          const isSelected = selectedLayerId === layer.id;
          return (
            <div
              key={layer.id}
              className={`editor-layer-item ${isSelected ? "active" : ""}`}
              onClick={() => onSelectLayer?.(layer.id)}
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
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility?.(layer.id);
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
                    onToggleLock?.(layer.id);
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
