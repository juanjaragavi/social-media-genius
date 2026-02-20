"use client";

import React, { useCallback } from "react";
import { useCanvasContext } from "../canvas-context";
import type { ShapeElement } from "@/types/editor";
import {
  Circle,
  Square,
  Triangle,
  Star,
  Minus,
  ImageIcon,
  Sticker,
  Smile,
  Shapes,
} from "lucide-react";

/**
 * ConnectedElementsPanel wraps the elements sidebar and connects it
 * to the shared CanvasContext so that clicking a shape/element
 * actually adds it to the interactive canvas.
 */

const SHAPE_MAP: Record<string, ShapeElement["shapeType"]> = {
  Rectángulo: "rect",
  Círculo: "circle",
  Triángulo: "triangle",
  Estrella: "star",
  Línea: "line",
};

export function ConnectedElementsPanel() {
  const { addShape, addText } = useCanvasContext();

  const handleShapeClick = useCallback(
    (name: string) => {
      const shapeType = SHAPE_MAP[name];
      if (shapeType) {
        addShape(shapeType);
      }
    },
    [addShape],
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar elementos"
          className="editor-panel-input pl-3 pr-8"
        />
      </div>

      {/* Category quick-access grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            icon: Shapes,
            label: "Formas",
            action: () => addShape("rect"),
          },
          {
            icon: ImageIcon,
            label: "Fotos",
            action: () => {},
          },
          {
            icon: Sticker,
            label: "Stickers",
            action: () => {},
          },
          {
            icon: Smile,
            label: "Emojis",
            action: () => addText("body"),
          },
          {
            icon: Square,
            label: "Marcos",
            action: () => addShape("rect"),
          },
          {
            icon: Star,
            label: "Íconos",
            action: () => addShape("star"),
          },
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
              onClick={cat.action}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                <Icon className="h-5 w-5 text-gray-500" />
              </div>
              <span className="text-[10px] text-gray-600 font-medium">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Shapes */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Formas
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Square, name: "Rectángulo" },
            { icon: Circle, name: "Círculo" },
            { icon: Triangle, name: "Triángulo" },
            { icon: Star, name: "Estrella" },
            { icon: Minus, name: "Línea" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => handleShapeClick(item.name)}
                className="aspect-square rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 flex items-center justify-center transition-colors cursor-pointer group"
                title={item.name}
              >
                <Icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Stickers / Emojis placeholder */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Íconos y stickers
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[
            { icon: Smile, name: "Emoji" },
            { icon: Star, name: "Favorito" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => addShape("star")}
                className="aspect-square rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 flex items-center justify-center transition-colors cursor-pointer group"
                title={item.name}
              >
                <Icon className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </button>
            );
          })}
        </div>
      </div>

      {/* AI elements hint */}
      <div className="p-4 rounded-lg bg-linear-to-br from-lime-50 to-cyan-50 border border-lime-200 text-center">
        <p className="text-xs text-gray-600 font-medium mb-1">
          Genera imágenes con IA
        </p>
        <p className="text-[10px] text-gray-400">
          Usa el panel Generar para crear elementos con Imagen 4.0
        </p>
      </div>
    </div>
  );
}
