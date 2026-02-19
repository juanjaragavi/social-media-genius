"use client";

import React from "react";
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

const ELEMENT_CATEGORIES = [
  {
    label: "Formas",
    icon: Shapes,
    items: [
      { icon: Square, name: "Rectángulo" },
      { icon: Circle, name: "Círculo" },
      { icon: Triangle, name: "Triángulo" },
      { icon: Star, name: "Estrella" },
      { icon: Minus, name: "Línea" },
    ],
  },
  {
    label: "Íconos y stickers",
    icon: Sticker,
    items: [
      { icon: Smile, name: "Emoji" },
      { icon: Star, name: "Favorito" },
    ],
  },
  {
    label: "Fotos",
    icon: ImageIcon,
    items: [],
  },
];

export function ElementsPanel() {
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

      {/* Category grid */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Shapes, label: "Formas" },
          { icon: ImageIcon, label: "Fotos" },
          { icon: Sticker, label: "Stickers" },
          { icon: Smile, label: "Emojis" },
          { icon: Square, label: "Marcos" },
          { icon: Star, label: "Íconos" },
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
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

      {/* Element categories with items */}
      {ELEMENT_CATEGORIES.filter((c) => c.items.length > 0).map((category) => (
        <div key={category.label} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {category.label}
            </span>
            <button className="text-[10px] text-blue-600 hover:text-blue-700 font-medium">
              Ver todo
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {category.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  className="aspect-square rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 flex items-center justify-center transition-colors cursor-pointer"
                  title={item.name}
                >
                  <Icon className="h-6 w-6 text-gray-500" />
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Placeholder for premium elements */}
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
