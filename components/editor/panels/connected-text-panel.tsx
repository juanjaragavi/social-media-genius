"use client";

import React, { useCallback } from "react";
import { Type, Wand2 } from "lucide-react";
import { useCanvasContext } from "../canvas-context";

const TEXT_PRESETS = [
  {
    id: "title" as const,
    label: "Agregar un título",
    className: "text-xl font-bold text-gray-900",
  },
  {
    id: "subtitle" as const,
    label: "Agregar un subtítulo",
    className: "text-base font-semibold text-gray-700",
  },
  {
    id: "body" as const,
    label: "Agregar algo de texto",
    className: "text-sm text-gray-600",
  },
];

const FONT_SUGGESTIONS = [
  { name: "Poppins", style: "font-sans", sample: "Ag" },
  { name: "Georgia", style: "font-serif", sample: "Ag" },
  { name: "Courier", style: "font-mono", sample: "Ag" },
];

/**
 * ConnectedTextPanel connects the text sidebar to the shared canvas context,
 * so clicking "Add text" actually inserts a text element onto the canvas.
 */
export function ConnectedTextPanel() {
  const { addText } = useCanvasContext();

  const handleAddText = useCallback(
    (preset: "title" | "subtitle" | "body") => {
      addText(preset);
    },
    [addText],
  );

  return (
    <div className="space-y-4">
      {/* Search fonts */}
      <div className="relative">
        <input
          type="text"
          placeholder="Busca fuentes y combinaciones"
          className="editor-panel-input pl-3 pr-8"
        />
      </div>

      {/* Add text box button */}
      <button
        onClick={() => handleAddText("body")}
        className="w-full py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
      >
        <Type className="h-4 w-4" />
        Agregar caja de texto
      </button>

      {/* AI text button */}
      <button className="w-full py-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        <Wand2 className="h-4 w-4 text-purple-500" />
        Texto Mágico
      </button>

      {/* Text presets */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Estilos de texto predeterminados
        </p>
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleAddText(preset.id)}
            className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors group"
          >
            <span
              className={`${preset.className} group-hover:text-blue-700 transition-colors`}
            >
              {preset.label}
            </span>
          </button>
        ))}
      </div>

      {/* Font suggestions */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Fuentes sugeridas
        </p>
        <div className="grid grid-cols-3 gap-2">
          {FONT_SUGGESTIONS.map((font) => (
            <button
              key={font.name}
              className="p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-colors text-center"
            >
              <div className={`text-2xl ${font.style} text-gray-700 mb-1`}>
                {font.sample}
              </div>
              <div className="text-[9px] text-gray-400 truncate">
                {font.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
