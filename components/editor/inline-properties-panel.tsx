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
  const [showStrokePicker, setShowStrokePicker] = useState(false);

  if (!selectedElement) {
    return (
      <div className="editor-properties-panel">
        <div className="editor-properties-header">
          <h3 className="text-sm font-semibold text-gray-800">Propiedades</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
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
              step="any"
              value={Math.round(selectedElement.x)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  x: parseFloat(e.target.value) || 0,
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Y</Label>
            <Input
              type="number"
              step="any"
              value={Math.round(selectedElement.y)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  y: parseFloat(e.target.value) || 0,
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Ancho</Label>
            <Input
              type="number"
              step="any"
              value={Math.round(selectedElement.width)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  width: parseFloat(e.target.value) || 100,
                })
              }
              className="h-7 text-xs"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-600">Alto</Label>
            <Input
              type="number"
              step="any"
              value={Math.round(selectedElement.height)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  height: parseFloat(e.target.value) || 100,
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
              step="any"
              value={Math.round(selectedElement.rotation)}
              onChange={(e) =>
                updateElement(selectedElement.id, {
                  rotation: parseFloat(e.target.value) || 0,
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

            {/* Text Resize Mode */}
            <div className="space-y-1 pt-2">
              <Label className="text-xs text-gray-600">Ajuste de texto</Label>
              <div className="flex bg-gray-100 p-1 rounded-md">
                {(
                  [
                    { value: "fixed", label: "Fijo" },
                    { value: "auto-height", label: "Auto Alto" },
                    { value: "auto-font-size", label: "Ajustar" },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.value}
                    onClick={() =>
                      updateElement(selectedElement.id, {
                        resizeMode: mode.value,
                      } as Partial<TextElement>)
                    }
                    className={`flex-1 text-[10px] py-1 px-2 rounded-sm transition-colors ${
                      ((selectedElement as TextElement).resizeMode ||
                        "auto-height") === mode.value
                        ? "bg-white shadow-sm text-gray-900 font-medium"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

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
                className={`p-1.5 rounded cursor-pointer ${(selectedElement as TextElement).fontWeight === "bold" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
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
                className={`p-1.5 rounded cursor-pointer ${(selectedElement as TextElement).fontStyle === "italic" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
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
                className={`p-1.5 rounded cursor-pointer ${(selectedElement as TextElement).textDecoration === "underline" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
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
                    className={`p-1.5 rounded cursor-pointer ${(selectedElement as TextElement).align === align ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
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
                    setShowStrokePicker(false);
                  }}
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm shrink-0 cursor-pointer"
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
                    setShowStrokePicker(false);
                  }}
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm shrink-0 cursor-pointer"
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowStrokePicker(!showStrokePicker);
                    setShowFillPicker(false);
                    setShowColorPicker(false);
                  }}
                  className="w-8 h-8 rounded border border-gray-300 shadow-sm shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: (selectedElement as ShapeElement).stroke,
                  }}
                />
                <Input
                  value={(selectedElement as ShapeElement).stroke}
                  onChange={(e) =>
                    updateElement(selectedElement.id, {
                      stroke: e.target.value,
                    } as Partial<ShapeElement>)
                  }
                  className="h-7 text-xs flex-1"
                  placeholder="#1d4ed8"
                />
              </div>
              {showStrokePicker && (
                <div className="mt-2">
                  <HexColorPicker
                    color={(selectedElement as ShapeElement).stroke}
                    onChange={(color) =>
                      updateElement(selectedElement.id, {
                        stroke: color,
                      } as Partial<ShapeElement>)
                    }
                  />
                </div>
              )}
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

            {/* Corner radius — only for rect shapes */}
            {(selectedElement as ShapeElement).shapeType === "rect" && (
              <div className="space-y-1">
                <Label className="text-xs text-gray-600">
                  Radio de esquina
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.round(
                      Math.min(
                        (selectedElement as ShapeElement).width,
                        (selectedElement as ShapeElement).height,
                      ) / 2,
                    )}
                    step="1"
                    value={(selectedElement as ShapeElement).cornerRadius || 0}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        cornerRadius: parseInt(e.target.value) || 0,
                      } as Partial<ShapeElement>)
                    }
                    className="flex-1 h-2 accent-blue-500"
                  />
                  <Input
                    type="number"
                    min="0"
                    value={(selectedElement as ShapeElement).cornerRadius || 0}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        cornerRadius: parseInt(e.target.value) || 0,
                      } as Partial<ShapeElement>)
                    }
                    className="h-7 text-xs w-16"
                  />
                </div>
              </div>
            )}

            {(selectedElement as ShapeElement).shapeType !== "path" && (
              <div className="pt-2">
                <button
                  onClick={() => {
                    const el = selectedElement as ShapeElement;
                    let pathPoints: {
                      x: number;
                      y: number;
                      cp1x?: number;
                      cp1y?: number;
                      cp2x?: number;
                      cp2y?: number;
                    }[] = [];
                    const w = el.width;
                    const h = el.height;

                    if (el.shapeType === "rect") {
                      pathPoints = [
                        { x: 0, y: 0 },
                        { x: w, y: 0 },
                        { x: w, y: h },
                        { x: 0, y: h },
                      ];
                    } else if (el.shapeType === "circle") {
                      const rx = w / 2;
                      const ry = h / 2;
                      const kappa = 0.5522848;
                      const ox = rx * kappa;
                      const oy = ry * kappa;
                      pathPoints = [
                        {
                          x: rx,
                          y: 0,
                          cp1x: 0,
                          cp1y: ry - oy,
                          cp2x: rx - ox,
                          cp2y: 0,
                        },
                        {
                          x: w,
                          y: ry,
                          cp1x: rx + ox,
                          cp1y: 0,
                          cp2x: w,
                          cp2y: ry - oy,
                        },
                        {
                          x: rx,
                          y: h,
                          cp1x: w,
                          cp1y: ry + oy,
                          cp2x: rx + ox,
                          cp2y: h,
                        },
                        {
                          x: 0,
                          y: ry,
                          cp1x: rx - ox,
                          cp1y: h,
                          cp2x: 0,
                          cp2y: ry + oy,
                        },
                      ];
                    } else if (el.shapeType === "triangle") {
                      pathPoints = [
                        { x: w / 2, y: 0 },
                        { x: w, y: h },
                        { x: 0, y: h },
                      ];
                    } else if (el.shapeType === "line") {
                      pathPoints = [
                        { x: 0, y: 0 },
                        { x: w, y: 0 },
                      ];
                    } else if (el.shapeType === "star") {
                      const cx = w / 2;
                      const cy = h / 2;
                      const outerRadius = Math.min(w, h) / 2;
                      const innerRadius = outerRadius / 2;
                      const numPoints = 5;
                      for (let i = 0; i < numPoints * 2; i++) {
                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                        const angle = (i * Math.PI) / numPoints - Math.PI / 2;
                        pathPoints.push({
                          x: cx + radius * Math.cos(angle),
                          y: cy + radius * Math.sin(angle),
                        });
                      }
                    }

                    updateElement(el.id, {
                      shapeType: "path",
                      pathPoints,
                      closed: el.shapeType !== "line",
                    } as Partial<ShapeElement>);
                  }}
                  className="w-full py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
                >
                  Convertir a Trazado
                </button>
              </div>
            )}
          </div>
        )}

        {/* Element actions */}
        <div className="flex items-center gap-1 border-t border-gray-200 pt-2">
          <button
            onClick={() => duplicateElement(selectedElement.id)}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
            title="Duplicar"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => moveElement(selectedElement.id, "up")}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
            title="Adelante"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => moveElement(selectedElement.id, "down")}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-600 cursor-pointer"
            title="Atrás"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => deleteElement(selectedElement.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500 cursor-pointer"
            title="Eliminar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
