"use client";

import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Stage, Layer, Rect, Text, Image, Transformer } from "react-konva";
import useImage from "use-image";
import { v4 as uuidv4 } from "uuid";
import { HexColorPicker } from "react-colorful";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UI_LABELS } from "@/lib/i18n/translations";
import type {
  AnyEditorElement,
  TextElement,
  ImageElement,
  WatermarkElement,
  WatermarkPosition,
  EditorState,
} from "@/types/editor";
import {
  Type,
  ImageIcon,
  Stamp,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Download,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Sparkles,
  Layers,
  X,
} from "lucide-react";
import type Konva from "konva";

// ─── Helpers ─────────────────────────────────────────────────

function createTextElement(overrides?: Partial<TextElement>): TextElement {
  return {
    id: uuidv4(),
    type: "text",
    x: 100,
    y: 100,
    width: 300,
    height: 60,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    name: "Texto",
    zIndex: 0,
    text: "Nuevo texto",
    fontSize: 32,
    fontFamily: "Poppins",
    fontWeight: "bold",
    fontStyle: "normal",
    textDecoration: "none",
    fill: "#000000",
    align: "center",
    lineHeight: 1.2,
    letterSpacing: 0,
    resizeMode: "auto-height",
    ...overrides,
  };
}

function createImageElement(
  src: string,
  overrides?: Partial<ImageElement>,
): ImageElement {
  return {
    id: uuidv4(),
    type: "image",
    x: 0,
    y: 0,
    width: 400,
    height: 400,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    name: "Imagen",
    zIndex: 0,
    src,
    ...overrides,
  };
}

function createWatermarkElement(
  src: string,
  position: WatermarkPosition = "bottom-right",
  canvasW: number,
  canvasH: number,
): WatermarkElement {
  const padding = 20;
  const size = 80;
  const posMap: Record<WatermarkPosition, { x: number; y: number }> = {
    "top-left": { x: padding, y: padding },
    "top-center": { x: canvasW / 2 - size / 2, y: padding },
    "top-right": { x: canvasW - size - padding, y: padding },
    center: { x: canvasW / 2 - size / 2, y: canvasH / 2 - size / 2 },
    "bottom-left": { x: padding, y: canvasH - size - padding },
    "bottom-center": { x: canvasW / 2 - size / 2, y: canvasH - size - padding },
    "bottom-right": {
      x: canvasW - size - padding,
      y: canvasH - size - padding,
    },
  };
  const pos = posMap[position];
  return {
    id: uuidv4(),
    type: "watermark",
    x: pos.x,
    y: pos.y,
    width: size,
    height: size,
    rotation: 0,
    opacity: 0.6,
    visible: true,
    locked: false,
    name: "Marca de Agua",
    zIndex: 999,
    src,
    position,
    padding,
    scale: 1,
  };
}

// ─── Canvas Image Component ─────────────────────────────────

function CanvasImage({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: ImageElement | WatermarkElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<AnyEditorElement>) => void;
}) {
  const [img] = useImage(element.src, "anonymous");
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      {/* Konva Image is a canvas element, not an HTML <img> — alt is not applicable */}
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <Image
        ref={shapeRef}
        image={img}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation}
        opacity={element.opacity}
        visible={element.visible}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !element.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(_oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20)
              return _oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ─── Canvas Text Component ──────────────────────────────────

function CanvasText({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: TextElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<TextElement>) => void;
}) {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={shapeRef}
        x={element.x}
        y={element.y}
        width={element.width}
        text={element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={
          `${element.fontWeight === "bold" ? "bold" : ""} ${element.fontStyle === "italic" ? "italic" : ""}`.trim() ||
          "normal"
        }
        textDecoration={
          element.textDecoration === "none" ? "" : element.textDecoration
        }
        fill={element.fill}
        align={element.align}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        rotation={element.rotation}
        opacity={element.opacity}
        visible={element.visible}
        draggable={!element.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !element.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(_oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20) return _oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ─── Main Editor Component ──────────────────────────────────

interface BannerEditorProps {
  initialImage?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  onClose?: () => void;
  onExport?: (dataUrl: string) => void;
}

export function BannerEditor({
  initialImage,
  canvasWidth: initialCanvasW = 1080,
  canvasHeight: initialCanvasH = 1080,
  onClose,
  onExport,
}: BannerEditorProps) {
  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Editor state
  const [state, setState] = useState<EditorState>(() => {
    const elements: AnyEditorElement[] = [];
    if (initialImage) {
      elements.push(
        createImageElement(initialImage, {
          width: initialCanvasW,
          height: initialCanvasH,
          name: "Fondo",
        }),
      );
    }
    return {
      elements,
      selectedElementId: null,
      canvasWidth: initialCanvasW,
      canvasHeight: initialCanvasH,
      backgroundColor: "#ffffff",
      zoom: 1,
      history: [],
      historyIndex: -1,
    };
  });

  // Side panel state
  const [activePanel, setActivePanel] = useState<
    "layers" | "text" | "properties" | "ai" | null
  >("layers");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  // Calculate scale to fit container
  const [containerSize, setContainerSize] = useState({ w: 600, h: 600 });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const scale = useMemo(() => {
    const scaleX = (containerSize.w - 32) / state.canvasWidth;
    const scaleY = (containerSize.h - 32) / state.canvasHeight;
    return Math.min(scaleX, scaleY, 1) * state.zoom;
  }, [containerSize, state.canvasWidth, state.canvasHeight, state.zoom]);

  // Selected element
  const selectedElement = state.elements.find(
    (el) => el.id === state.selectedElementId,
  );

  // ─── Element Operations ──────────────────────────────────

  const updateElement = useCallback(
    (id: string, updates: Partial<AnyEditorElement>) => {
      setState((prev) => ({
        ...prev,
        elements: prev.elements.map((el) =>
          el.id === id ? ({ ...el, ...updates } as AnyEditorElement) : el,
        ),
      }));
    },
    [],
  );

  const addElement = useCallback((element: AnyEditorElement) => {
    setState((prev) => ({
      ...prev,
      elements: [
        ...prev.elements,
        { ...element, zIndex: prev.elements.length },
      ],
      selectedElementId: element.id,
    }));
  }, []);

  const deleteElement = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      elements: prev.elements.filter((el) => el.id !== id),
      selectedElementId:
        prev.selectedElementId === id ? null : prev.selectedElementId,
    }));
  }, []);

  const duplicateElement = useCallback(
    (id: string) => {
      const el = state.elements.find((e) => e.id === id);
      if (!el) return;
      const dup = {
        ...el,
        id: uuidv4(),
        x: el.x + 20,
        y: el.y + 20,
        name: `${el.name} (copia)`,
      } as AnyEditorElement;
      addElement(dup);
    },
    [state.elements, addElement],
  );

  const moveElement = useCallback((id: string, direction: "up" | "down") => {
    setState((prev) => {
      const idx = prev.elements.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === "up" ? idx + 1 : idx - 1;
      if (newIdx < 0 || newIdx >= prev.elements.length) return prev;
      const els = [...prev.elements];
      [els[idx], els[newIdx]] = [els[newIdx], els[idx]];
      return { ...prev, elements: els };
    });
  }, []);

  // ─── Add Operations ──────────────────────────────────────

  const handleAddText = () => {
    addElement(createTextElement());
    setActivePanel("properties");
  };

  const handleAddImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        addElement(
          createImageElement(src, {
            width: state.canvasWidth * 0.5,
            height: state.canvasHeight * 0.5,
            x: state.canvasWidth * 0.25,
            y: state.canvasHeight * 0.25,
          }),
        );
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleAddWatermark = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        addElement(
          createWatermarkElement(
            src,
            "bottom-right",
            state.canvasWidth,
            state.canvasHeight,
          ),
        );
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  // ─── AI Edit ─────────────────────────────────────────────

  const handleAiEdit = async () => {
    if (!aiPrompt.trim() || !stageRef.current) return;
    setAiLoading(true);
    try {
      // Export current canvas as base64
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 1 });

      const response = await fetch("/api/ai-edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          imageBase64: dataUrl.split(",")[1],
        }),
      });

      const data = await response.json();
      if (data.success && data.image?.dataUrl) {
        // Replace background image with AI-edited version
        setState((prev) => {
          const bgIndex = prev.elements.findIndex(
            (el) => el.type === "image" && el.name === "Fondo",
          );
          if (bgIndex >= 0) {
            const newElements = [...prev.elements];
            newElements[bgIndex] = {
              ...newElements[bgIndex],
              src: data.image.dataUrl,
            } as ImageElement;
            return { ...prev, elements: newElements };
          }
          return {
            ...prev,
            elements: [
              createImageElement(data.image.dataUrl, {
                width: prev.canvasWidth,
                height: prev.canvasHeight,
                name: "Fondo",
              }),
              ...prev.elements,
            ],
          };
        });
        setAiPrompt("");
      }
    } catch (err) {
      console.error("AI edit failed:", err);
    } finally {
      setAiLoading(false);
    }
  };

  // ─── Export ──────────────────────────────────────────────

  const handleExport = useCallback(() => {
    if (!stageRef.current) return;
    // Deselect to hide transformer
    setState((prev) => ({ ...prev, selectedElementId: null }));
    setTimeout(() => {
      const dataUrl = stageRef.current!.toDataURL({
        pixelRatio: state.canvasWidth / (state.canvasWidth * scale),
        x: 0,
        y: 0,
        width: state.canvasWidth * scale,
        height: state.canvasHeight * scale,
      });
      if (onExport) {
        onExport(dataUrl);
      } else {
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `banner-edited-${Date.now()}.png`;
        link.click();
      }
    }, 100);
  }, [scale, state.canvasWidth, state.canvasHeight, onExport]);

  // ─── Keyboard Shortcuts ──────────────────────────────────

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        // Only delete if not typing in an input
        if (
          (e.target as HTMLElement).tagName === "INPUT" ||
          (e.target as HTMLElement).tagName === "TEXTAREA"
        )
          return;
        if (state.selectedElementId) {
          deleteElement(state.selectedElementId);
        }
      }
      if (e.key === "Escape") {
        setState((prev) => ({ ...prev, selectedElementId: null }));
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.selectedElementId, deleteElement]);

  // ─── Render ──────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-800">
            {UI_LABELS.editorTitle}
          </h3>
          <span className="text-xs text-gray-500">
            {state.canvasWidth}×{state.canvasHeight}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Zoom controls */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                zoom: Math.max(0.25, prev.zoom - 0.1),
              }))
            }
            className="text-xs px-2"
          >
            −
          </Button>
          <span className="text-xs text-gray-600 min-w-12 text-center">
            {Math.round(state.zoom * 100)}%
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              setState((prev) => ({
                ...prev,
                zoom: Math.min(3, prev.zoom + 0.1),
              }))
            }
            className="text-xs px-2"
          >
            +
          </Button>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            className="text-xs bg-linear-to-r from-lime-50 to-cyan-50 text-lime-700 border-lime-200"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            {UI_LABELS.exportImage}
          </Button>
          {onClose && (
            <Button size="sm" variant="ghost" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Tool Strip */}
        <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-2 gap-1">
          <button
            onClick={() =>
              setActivePanel(activePanel === "layers" ? null : "layers")
            }
            className={`p-2 rounded-lg transition-colors ${activePanel === "layers" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100 text-gray-600"}`}
            title={UI_LABELS.layers}
          >
            <Layers className="h-4 w-4" />
          </button>
          <button
            onClick={handleAddText}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title={UI_LABELS.addText}
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            onClick={handleAddImage}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title={UI_LABELS.addImage}
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            onClick={handleAddWatermark}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
            title={UI_LABELS.addWatermark}
          >
            <Stamp className="h-4 w-4" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => setActivePanel(activePanel === "ai" ? null : "ai")}
            className={`p-2 rounded-lg transition-colors ${activePanel === "ai" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-gray-600"}`}
            title={UI_LABELS.aiEdit}
          >
            <Sparkles className="h-4 w-4" />
          </button>
        </div>

        {/* Side Panel */}
        {activePanel && (
          <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto p-3 space-y-3">
            {/* Layers Panel */}
            {activePanel === "layers" && (
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {UI_LABELS.layers}
                </h4>
                {[...state.elements].reverse().map((el) => (
                  <div
                    key={el.id}
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        selectedElementId: el.id,
                      }))
                    }
                    className={`flex items-center gap-2 p-2 rounded-md cursor-pointer text-xs transition-colors ${
                      state.selectedElementId === el.id
                        ? "bg-lime-50 border border-lime-300"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span className="flex-1 truncate text-gray-700">
                      {el.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, { visible: !el.visible });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {el.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateElement(el.id, { locked: !el.locked });
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {el.locked ? (
                        <Lock className="h-3 w-3" />
                      ) : (
                        <Unlock className="h-3 w-3" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Properties Panel (auto-show when element selected) */}
            {(activePanel === "properties" ||
              (activePanel === "layers" && selectedElement)) &&
              selectedElement && (
                <div className="space-y-3 border-t border-gray-200 pt-3">
                  <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Propiedades
                  </h4>

                  {/* Name */}
                  <div className="space-y-1">
                    <Label className="text-xs">Nombre</Label>
                    <Input
                      value={selectedElement.name}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          name: e.target.value,
                        })
                      }
                      className="h-7 text-xs"
                    />
                  </div>

                  {/* Position & Size */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">X</Label>
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
                      <Label className="text-xs">Y</Label>
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
                      <Label className="text-xs">Ancho</Label>
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
                      <Label className="text-xs">Alto</Label>
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
                      <Label className="text-xs">{UI_LABELS.opacity}</Label>
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
                        className="w-full h-2"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">{UI_LABELS.rotation}</Label>
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
                      <Label className="text-xs">Texto</Label>
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
                          <Label className="text-xs">
                            {UI_LABELS.fontFamily}
                          </Label>
                          <select
                            value={(selectedElement as TextElement).fontFamily}
                            onChange={(e) =>
                              updateElement(selectedElement.id, {
                                fontFamily: e.target.value,
                              } as Partial<TextElement>)
                            }
                            className="w-full h-7 text-xs rounded border border-gray-200 px-1"
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
                          <Label className="text-xs">
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
                                (selectedElement as TextElement).fontWeight ===
                                "bold"
                                  ? "normal"
                                  : "bold",
                            } as Partial<TextElement>)
                          }
                          className={`p-1.5 rounded ${(selectedElement as TextElement).fontWeight === "bold" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100"}`}
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            updateElement(selectedElement.id, {
                              fontStyle:
                                (selectedElement as TextElement).fontStyle ===
                                "italic"
                                  ? "normal"
                                  : "italic",
                            } as Partial<TextElement>)
                          }
                          className={`p-1.5 rounded ${(selectedElement as TextElement).fontStyle === "italic" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100"}`}
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            updateElement(selectedElement.id, {
                              textDecoration:
                                (selectedElement as TextElement)
                                  .textDecoration === "underline"
                                  ? "none"
                                  : "underline",
                            } as Partial<TextElement>)
                          }
                          className={`p-1.5 rounded ${(selectedElement as TextElement).textDecoration === "underline" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100"}`}
                        >
                          <Underline className="h-3.5 w-3.5" />
                        </button>
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                        <button
                          onClick={() =>
                            updateElement(selectedElement.id, {
                              align: "left",
                            } as Partial<TextElement>)
                          }
                          className={`p-1.5 rounded ${(selectedElement as TextElement).align === "left" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100"}`}
                        >
                          <AlignLeft className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            updateElement(selectedElement.id, {
                              align: "center",
                            } as Partial<TextElement>)
                          }
                          className={`p-1.5 rounded ${(selectedElement as TextElement).align === "center" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100"}`}
                        >
                          <AlignCenter className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            updateElement(selectedElement.id, {
                              align: "right",
                            } as Partial<TextElement>)
                          }
                          className={`p-1.5 rounded ${(selectedElement as TextElement).align === "right" ? "bg-lime-100 text-lime-700" : "hover:bg-gray-100"}`}
                        >
                          <AlignRight className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Color Picker */}
                      <div className="space-y-1">
                        <Label className="text-xs">{UI_LABELS.fontColor}</Label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-8 h-8 rounded border border-gray-300 shadow-sm"
                            style={{
                              backgroundColor: (selectedElement as TextElement)
                                .fill,
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

                  {/* Watermark position */}
                  {selectedElement.type === "watermark" && (
                    <div className="space-y-2 border-t border-gray-200 pt-2">
                      <Label className="text-xs">
                        {UI_LABELS.watermarkPosition}
                      </Label>
                      <select
                        value={(selectedElement as WatermarkElement).position}
                        onChange={(e) => {
                          const pos = e.target.value as WatermarkPosition;
                          const padding = 20;
                          const posMap: Record<
                            WatermarkPosition,
                            { x: number; y: number }
                          > = {
                            "top-left": { x: padding, y: padding },
                            "top-center": {
                              x:
                                state.canvasWidth / 2 -
                                selectedElement.width / 2,
                              y: padding,
                            },
                            "top-right": {
                              x:
                                state.canvasWidth -
                                selectedElement.width -
                                padding,
                              y: padding,
                            },
                            center: {
                              x:
                                state.canvasWidth / 2 -
                                selectedElement.width / 2,
                              y:
                                state.canvasHeight / 2 -
                                selectedElement.height / 2,
                            },
                            "bottom-left": {
                              x: padding,
                              y:
                                state.canvasHeight -
                                selectedElement.height -
                                padding,
                            },
                            "bottom-center": {
                              x:
                                state.canvasWidth / 2 -
                                selectedElement.width / 2,
                              y:
                                state.canvasHeight -
                                selectedElement.height -
                                padding,
                            },
                            "bottom-right": {
                              x:
                                state.canvasWidth -
                                selectedElement.width -
                                padding,
                              y:
                                state.canvasHeight -
                                selectedElement.height -
                                padding,
                            },
                          };
                          updateElement(selectedElement.id, {
                            position: pos,
                            ...posMap[pos],
                          } as Partial<WatermarkElement>);
                        }}
                        className="w-full h-7 text-xs rounded border border-gray-200 px-1"
                      >
                        {Object.entries(UI_LABELS.watermarkPositions).map(
                          ([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  )}

                  {/* Element actions */}
                  <div className="flex items-center gap-1 border-t border-gray-200 pt-2">
                    <button
                      onClick={() => duplicateElement(selectedElement.id)}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                      title={UI_LABELS.duplicateElement}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveElement(selectedElement.id, "up")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                      title={UI_LABELS.bringForward}
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => moveElement(selectedElement.id, "down")}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                      title={UI_LABELS.sendBackward}
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                    <div className="flex-1" />
                    <button
                      onClick={() => deleteElement(selectedElement.id)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-500"
                      title={UI_LABELS.deleteElement}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

            {/* AI Edit Panel */}
            {activePanel === "ai" && (
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  {UI_LABELS.aiEdit}
                </h4>
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={UI_LABELS.aiEditPlaceholder}
                  rows={4}
                  className="text-xs"
                />
                <Button
                  onClick={handleAiEdit}
                  disabled={aiLoading || !aiPrompt.trim()}
                  size="sm"
                  className="w-full bg-linear-to-r from-blue-600 to-cyan-600 text-white text-xs"
                >
                  {aiLoading ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5 mr-1" />
                      {UI_LABELS.applyAiEdit}
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500">
                  Ejemplos: &ldquo;Haz el fondo más oscuro&rdquo;, &ldquo;Agrega
                  un efecto de luz cálida&rdquo;, &ldquo;Cambia los colores a
                  tonos azules&rdquo;
                </p>
              </div>
            )}
          </div>
        )}

        {/* Canvas Area */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center justify-center bg-gray-200/50 overflow-auto p-4"
          onClick={(e) => {
            if (e.target === containerRef.current) {
              setState((prev) => ({ ...prev, selectedElementId: null }));
            }
          }}
        >
          <div
            className="shadow-xl rounded-lg overflow-hidden"
            style={{
              width: state.canvasWidth * scale,
              height: state.canvasHeight * scale,
            }}
          >
            <Stage
              ref={stageRef}
              width={state.canvasWidth * scale}
              height={state.canvasHeight * scale}
              scaleX={scale}
              scaleY={scale}
              onMouseDown={(e) => {
                if (e.target === e.target.getStage()) {
                  setState((prev) => ({ ...prev, selectedElementId: null }));
                }
              }}
            >
              <Layer>
                {/* Background */}
                <Rect
                  x={0}
                  y={0}
                  width={state.canvasWidth}
                  height={state.canvasHeight}
                  fill={state.backgroundColor}
                />

                {/* Elements */}
                {state.elements
                  .filter((el) => el.visible)
                  .map((el) => {
                    if (el.type === "text") {
                      return (
                        <CanvasText
                          key={el.id}
                          element={el as TextElement}
                          isSelected={state.selectedElementId === el.id}
                          onSelect={() =>
                            setState((prev) => ({
                              ...prev,
                              selectedElementId: el.id,
                            }))
                          }
                          onChange={(updates) => updateElement(el.id, updates)}
                        />
                      );
                    }
                    if (el.type === "image" || el.type === "watermark") {
                      return (
                        <CanvasImage
                          key={el.id}
                          element={el as ImageElement}
                          isSelected={state.selectedElementId === el.id}
                          onSelect={() =>
                            setState((prev) => ({
                              ...prev,
                              selectedElementId: el.id,
                            }))
                          }
                          onChange={(updates) => updateElement(el.id, updates)}
                        />
                      );
                    }
                    return null;
                  })}
              </Layer>
            </Stage>
          </div>
        </div>
      </div>
    </div>
  );
}
