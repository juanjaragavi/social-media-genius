"use client";

import React, { useState } from "react";
import { HexColorPicker } from "react-colorful";
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCanvasContext } from "./canvas-context";
import type { TextElement, ShapeElement } from "@/types/editor";
import { UI_LABELS } from "@/lib/i18n/translations";

export function InlinePropertiesPanel({ onClose }: { onClose: () => void }) {
  const {
    selectedElement,
    updateElement,
    deleteElement,
    duplicateElement,
    moveElement,
  } = useCanvasContext();

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFillPicker, setShowFillPicker] = useState(false);

  if (!selectedElement) {
    return (
      <div className="editor-properties-panel">
        <div className="editor-properties-header">
          <h3 className="text-sm font-semibold text-gray-800">Propiedades</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="editor-properties-content flex items-center justify-center">
          <p className="text-xs text-gray-400">
            Selecciona un elemento para editar sus propiedades
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-properties-panel">
      {/* Header */}
      <div className="editor-properties-header">
        <h3 className="text-sm font-semibold text-gray-800">Propiedades</h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="editor-properties-content space-y-3">
        {/* Name */}
        <div className="space-y-1">
          <Label className="text-xs text-gray-600">Nombre</Label>
          <Input
            value={selectedElement.name}
            onChange={(e) =>
              updateElement(selectedElement.id, { name: e.target.value })
            }
            className="h-7 text-xs"
          />
        </div>

        {/* Position & Size */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600">X</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  x: parseInt(e.target.value) || 0,
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Y</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  y: parseInt(e.target.value) || 0,
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Ancho</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.width)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  width: parseInt(e.target.value) || 100,
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Alto</Label>
            <Input
              type="number"
              value={Math.round(selectedElement.height)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  height: parseInt(e.target.value) || 100,
                })
              }
              className="h-7 text-xs"
            />
          </div>
        </div>

        {/* Opacity & Rotation */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-gray-600">{UI_LABELS.opacity}</Label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={selectedElement.opacity}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    opacity: parseFloat(e.target.value),
                  })
                }
                className="flex-1 h-2 accent-lime-500"
              />
              <span className="text-[10px] text-gray-500 w-8 text-right">
                {Math.round(selectedElement.opacity * 100)}%
              </span>
            </div>
          </div>
          <div>
            <Label className="text-xs text-gray-600">
              {UI_LABELS.rotation}
            </Label>
            <Input
              type="number"
              value={Math.round(selectedElement.rotation)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  rotation: parseInt(e.target.value) || 0,
                })
              }
              className="h-7 text-xs"
            />
          </div>
        </div>

        {/* Text-specific properties */}
        {selectedElement.type === "text" && (
          <div className="space-y-2 border-t border-gray-200 pt-2">
            <Label className="text-xs text-gray-600">Texto</Label>
            <Textarea
              value={(selectedElement as TextElement).text}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  text: e.target.value,
                } as Partial<TextElement>)
              }
              rows={2}
              className="text-xs"
            />

            {/* Font controls */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-gray-600">
                  {UI_LABELS.fontFamily}
                </Label>
                <select
                  value={(selectedElement as TextElement).fontFamily}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      fontFamily: e.target.value,
                    } as Partial<TextElement>)
                  }
                  className="w-full h-7 text-xs rounded border border-gray-200 px-1 bg-white"
                >
                  {[
                    "Poppins",
                    "Arial",
                    "Helvetica",
                    "Georgia",
                    "Times New Roman",
                    "Courier New",
                    "Verdana",
                    "Impact",
                  ].map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label className="text-xs text-gray-600">
                  {UI_LABELS.fontSize}
                </Label>
                <Input
                  type="number"
                  value={(selectedElement as TextElement).fontSize}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      fontSize: parseInt(e.target.value) || 16,
                    } as Partial<TextElement>)
                  }
                  className="h-7 text-xs"
                />
              </div>
            </div>

            {/* Style buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    fontWeight:
                      (selectedElement as TextElement).fontWeight === "bold"
                        ? "normal"
                        : "bold",
                  } as Partial<TextElement>)
                }
                className={`p-1.5 rounded ${(selectedElement as TextElement).fontWeight === "bold" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
              >
                <Bold className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    fontStyle:
                      (selectedElement as TextElement).fontStyle === "italic"
                        ? "normal"
                        : "italic",
                  } as Partial<TextElement>)
                }
                className={`p-1.5 rounded ${(selectedElement as TextElement).fontStyle === "italic" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
              >
                <Italic className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() =>
                  updateElement(selectedElement.id, {
                    textDecoration:
                      (selectedElement as TextElement).textDecoration ===
                      "underline"
                        ? "none"
                        : "underline",
                  } as Partial<TextElement>)
                }
                className={`p-1.5 rounded ${(selectedElement as TextElement).textDecoration === "underline" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
              >
                <Underline className="h-3.5 w-3.5" />
              </button>
              <div className="w-px h-5 bg-gray-200 mx-1" />
              {(["left", "center", "right"] as const).map((align) => {
                const Icon =
                  align === "left"
                    ? AlignLeft
                    : align === "center"
                      ? AlignCenter
                      : AlignRight;
                return (
                  <button
                    key={align}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        align,
                      } as Partial<TextElement>)
                    }
                    className={`p-1.5 rounded ${(selectedElement as TextElement).align === align ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>

            {/* Text Color Picker */}
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">
                {UI_LABELS.fontColor}
              </Label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowColorPicker(!showColorPicker);
                    setShowFillPicker(false);
                  }}
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm shrink-0"
                  style={{
                    backgroundColor: (selectedElement as TextElement).fill,
                  }}
                />
                <Input
                  value={(selectedElement as TextElement).fill}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      fill: e.target.value,
                    } as Partial<TextElement>)
                  }
                  className="h-7 text-xs flex-1"
                  placeholder="#000000"
                />
              </div>
              {showColorPicker && (
                <div className="mt-2">
                  <HexColorPicker
                    color={(selectedElement as TextElement).fill}
                    onChange={(color) =>
                      updateElement(selectedElement.id, {
                        fill: color,
                      } as Partial<TextElement>)
                    }
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shape-specific properties */}
        {selectedElement.type === "shape" && (
          <div className="space-y-2 border-t border-gray-200 pt-2">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Color de relleno</Label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowFillPicker(!showFillPicker);
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm shrink-0"
                  style={{
                    backgroundColor: (selectedElement as ShapeElement).fill,
                  }}
                />
                <Input
                  value={(selectedElement as ShapeElement).fill}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      fill: e.target.value,
                    } as Partial<ShapeElement>)
                  }
                  className="h-7 text-xs flex-1"
                  placeholder="#3b82f6"
                />
              </div>
              {showFillPicker && (
                <div className="mt-2">
                  <HexColorPicker
                    color={(selectedElement as ShapeElement).fill}
                    onChange={(color) =>
                      updateElement(selectedElement.id, {
                        fill: color,
                      } as Partial<ShapeElement>)
                    }
                  />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Color de borde</Label>
              <Input
                value={(selectedElement as ShapeElement).stroke}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    stroke: e.target.value,
                  } as Partial<ShapeElement>)
                }
                className="h-7 text-xs"
                placeholder="#1d4ed8"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Grosor de borde</Label>
              <Input
                type="number"
                value={(selectedElement as ShapeElement).strokeWidth}
                onChange={(e) =>
                  updateElement(selectedElement.id, {
                    strokeWidth: parseInt(e.target.value) || 0,
                  } as Partial<ShapeElement>)
                }
                className="h-7 text-xs"
              />
            </div>
          </div>
        )}

        {/* Element actions */}
        <div className="flex items-center gap-1 border-t border-gray-200 pt-2">
          <button
            onClick={() => duplicateElement(selectedElement.id)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="Duplicar"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => moveElement(selectedElement.id, "up")}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="Adelante"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => moveElement(selectedElement.id, "down")}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
            title="Atrás"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => deleteElement(selectedElement.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
