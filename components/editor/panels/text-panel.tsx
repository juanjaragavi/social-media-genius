"use client";

import React from "react";
import {
  Type,
  ALargeSmall,
  Heading1,
  Heading2,
  TextCursorInput,
  Wand2,
} from "lucide-react";

interface TextPanelProps {
  onAddText?: (preset: string) => void;
}

const TEXT_PRESETS = [
  {
    id: "title",
    label: "Agregar un título",
    className: "text-xl font-bold text-gray-900",
    sampleText: "Título",
    fontSize: 48,
  },
  {
    id: "subtitle",
    label: "Agregar un subtítulo",
    className: "text-base font-semibold text-gray-700",
    sampleText: "Subtítulo",
    fontSize: 32,
  },
  {
    id: "body",
    label: "Agregar algo de texto",
    className: "text-sm text-gray-600",
    sampleText: "Texto de cuerpo",
    fontSize: 18,
  },
];

const FONT_SUGGESTIONS = [
  { name: "Poppins", style: "font-sans", sample: "Ag" },
  { name: "Georgia", style: "font-serif", sample: "Ag" },
  { name: "Courier", style: "font-mono", sample: "Ag" },
];

export function TextPanel({ onAddText }: TextPanelProps) {
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
        onClick={() => onAddText?.("body")}
        className="w-full py-2.5 rounded-lg bg-linear-to-r from-blue-500 to-cyan-500 text-white text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-2"
      >
        <Type className="h-4 w-4" />
        Agregar caja de texto
      </button>

      {/* AI text */}
      <button className="w-full py-2 rounded-lg border border-gray-200 hover:border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
        <Wand2 className="h-4 w-4 text-purple-500" />
        Texto Mágico
      </button>

      {/* Text style presets */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Estilos de texto predeterminados
        </p>
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onAddText?.(preset.id)}
            className="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <span className={preset.className}>{preset.label}</span>
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
