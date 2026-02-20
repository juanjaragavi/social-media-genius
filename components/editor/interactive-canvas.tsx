"use client";

import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState,
} from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Image,
  Transformer,
  Circle,
  Star,
  Line,
  RegularPolygon,
  Shape,
  Group,
} from "react-konva";
import useImage from "use-image";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import {
  useCanvasContext,
  createImageElement as createImageElementFn,
  createShapeElement as createShapeElementFn,
  createTextElement as createTextElementFn,
} from "./canvas-context";
import type {
  AnyEditorElement,
  TextElement,
  ImageElement,
  ShapeElement,
} from "@/types/editor";
import Konva from "konva";

// ─── Canvas Image Component ─────────────────────────────

function CanvasImageElement({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: ImageElement;
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

// ─── Canvas Text Component ──────────────────────────────

function CanvasTextElement({
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

  const fontStyle =
    `${element.fontWeight === "bold" ? "bold" : ""} ${element.fontStyle === "italic" ? "italic" : ""}`.trim() ||
    "normal";

  const calculatedFontSize = useMemo(() => {
    if (element.resizeMode !== "auto-font-size") return element.fontSize;
    if (typeof window === "undefined") return element.fontSize;

    let low = 8;
    let high = element.fontSize;
    let result = 8;

    // Use Konva.Text to measure height with word wrap
    const tempText = new Konva.Text({
      text: element.text,
      width: element.width,
      fontFamily: element.fontFamily,
      fontStyle,
      lineHeight: element.lineHeight,
      letterSpacing: element.letterSpacing,
      wrap: "word",
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      tempText.fontSize(mid);
      if (tempText.height() <= element.height) {
        result = mid;
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    tempText.destroy();
    return result;
  }, [
    element.resizeMode,
    element.fontSize,
    element.text,
    element.width,
    element.height,
    element.fontFamily,
    fontStyle,
    element.lineHeight,
    element.letterSpacing,
  ]);

  return (
    <>
      <Text
        ref={shapeRef}
        x={element.x}
        y={element.y}
        width={element.width}
        height={
          element.resizeMode === "auto-height" ? undefined : element.height
        }
        text={element.text}
        fontSize={calculatedFontSize}
        fontFamily={element.fontFamily}
        fontStyle={fontStyle}
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
        onTransform={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);

          const newWidth = Math.max(20, node.width() * scaleX);
          const newHeight = Math.max(20, node.height() * scaleY);

          node.width(newWidth);
          if (element.resizeMode !== "auto-height") {
            node.height(newHeight);
          }

          // Update state during transform for real-time reflow and font-size calculation
          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height:
              element.resizeMode === "auto-height" ? node.height() : newHeight,
            rotation: node.rotation(),
          });
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);

          const newWidth = Math.max(20, node.width() * scaleX);
          const newHeight = Math.max(20, node.height() * scaleY);

          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height:
              element.resizeMode === "auto-height" ? node.height() : newHeight,
            rotation: node.rotation(),
          });
        }}
      />
      {isSelected && !element.locked && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={
            element.resizeMode === "auto-height"
              ? ["middle-left", "middle-right"]
              : [
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                  "middle-left",
                  "middle-right",
                  "top-center",
                  "bottom-center",
                ]
          }
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

// ─── Canvas Shape Component ─────────────────────────────

function CanvasShapeElement({
  element,
  isSelected,
  onSelect,
  onChange,
}: {
  element: ShapeElement;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (updates: Partial<ShapeElement>) => void;
}) {
  const shapeRef = useRef<Konva.Shape>(null);
  const trRef = useRef<Konva.Transformer>(null);

  // Re-attach Transformer whenever the element or selection changes so that
  // property edits from the panel (width, height, fill, etc.) are reflected
  // immediately on the bounding-box handles.
  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected, element]);

  // Center-based Konva primitives (Circle, RegularPolygon, Star) render at
  // their center, but we store element.x / element.y as the top-left corner.
  // The offset must be applied when reading back positions from Konva nodes.
  const isCenterBased =
    element.shapeType === "circle" ||
    element.shapeType === "triangle" ||
    element.shapeType === "star";

  const commonProps = {
    x: element.x,
    y: element.y,
    rotation: element.rotation,
    opacity: element.opacity,
    visible: element.visible,
    draggable: !element.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      if (isCenterBased) {
        onChange({
          x: e.target.x() - element.width / 2,
          y: e.target.y() - element.height / 2,
        });
      } else {
        onChange({ x: e.target.x(), y: e.target.y() });
      }
    },
    // Live feedback during transform — keeps Ancho/Alto in sync in real time
    onTransform: () => {
      const node = shapeRef.current;
      if (!node) return;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      const newWidth = Math.max(20, node.width() * scaleX);
      const newHeight = Math.max(20, node.height() * scaleY);

      // Write back to the Konva node so the visual doesn't flicker
      // between scale-reset and the React re-render.
      node.width(newWidth);
      node.height(newHeight);

      if (isCenterBased) {
        onChange({
          x: node.x() - newWidth / 2,
          y: node.y() - newHeight / 2,
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        });
      } else {
        onChange({
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        });
      }
    },
    onTransformEnd: () => {
      const node = shapeRef.current;
      if (!node) return;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);

      if (element.shapeType === "path" && element.pathPoints) {
        const newPts = element.pathPoints.map((pt) => ({
          ...pt,
          x: pt.x * scaleX,
          y: pt.y * scaleY,
          cp1x: pt.cp1x !== undefined ? pt.cp1x * scaleX : undefined,
          cp1y: pt.cp1y !== undefined ? pt.cp1y * scaleY : undefined,
          cp2x: pt.cp2x !== undefined ? pt.cp2x * scaleX : undefined,
          cp2y: pt.cp2y !== undefined ? pt.cp2y * scaleY : undefined,
        }));
        onChange({
          x: node.x(),
          y: node.y(),
          width: Math.max(20, node.width() * scaleX),
          height: Math.max(20, node.height() * scaleY),
          rotation: node.rotation(),
          pathPoints: newPts,
        });
      } else {
        const newWidth = Math.max(20, node.width() * scaleX);
        const newHeight = Math.max(20, node.height() * scaleY);

        if (isCenterBased) {
          onChange({
            x: node.x() - newWidth / 2,
            y: node.y() - newHeight / 2,
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
          });
        } else {
          onChange({
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            rotation: node.rotation(),
          });
        }
      }
    },
  };

  const renderShape = () => {
    switch (element.shapeType) {
      case "rect":
        return (
          <Rect
            ref={shapeRef as React.RefObject<Konva.Rect>}
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            cornerRadius={element.cornerRadius || 0}
          />
        );
      case "circle":
        return (
          <Circle
            ref={shapeRef as React.RefObject<Konva.Circle>}
            {...commonProps}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            radius={Math.min(element.width, element.height) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case "triangle":
        return (
          <RegularPolygon
            ref={shapeRef as React.RefObject<Konva.RegularPolygon>}
            {...commonProps}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            sides={3}
            radius={Math.min(element.width, element.height) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case "star":
        return (
          <Star
            ref={shapeRef as React.RefObject<Konva.Star>}
            {...commonProps}
            x={element.x + element.width / 2}
            y={element.y + element.height / 2}
            numPoints={5}
            innerRadius={Math.min(element.width, element.height) / 4}
            outerRadius={Math.min(element.width, element.height) / 2}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
          />
        );
      case "line":
        return (
          <Line
            ref={shapeRef as React.RefObject<Konva.Line>}
            {...commonProps}
            points={[0, 0, element.width, 0]}
            stroke={element.stroke || element.fill}
            strokeWidth={element.strokeWidth || 4}
          />
        );
      case "path":
        return (
          <Shape
            ref={shapeRef as React.RefObject<Konva.Shape>}
            {...commonProps}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            sceneFunc={(ctx, shape) => {
              if (!element.pathPoints || element.pathPoints.length === 0)
                return;
              ctx.beginPath();
              const pts = element.pathPoints;
              ctx.moveTo(pts[0].x, pts[0].y);
              for (let i = 1; i < pts.length; i++) {
                const pt = pts[i];
                if (
                  pt.cp1x !== undefined &&
                  pt.cp1y !== undefined &&
                  pt.cp2x !== undefined &&
                  pt.cp2y !== undefined
                ) {
                  ctx.bezierCurveTo(
                    pt.cp1x,
                    pt.cp1y,
                    pt.cp2x,
                    pt.cp2y,
                    pt.x,
                    pt.y,
                  );
                } else {
                  ctx.lineTo(pt.x, pt.y);
                }
              }
              if (element.closed) {
                const pt = pts[0];
                if (
                  pt.cp1x !== undefined &&
                  pt.cp1y !== undefined &&
                  pt.cp2x !== undefined &&
                  pt.cp2y !== undefined
                ) {
                  ctx.bezierCurveTo(
                    pt.cp1x,
                    pt.cp1y,
                    pt.cp2x,
                    pt.cp2y,
                    pt.x,
                    pt.y,
                  );
                } else {
                  ctx.lineTo(pt.x, pt.y);
                }
                ctx.closePath();
              }
              ctx.fillStrokeShape(shape);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderShape()}
      {isSelected && !element.locked && element.shapeType !== "path" && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-center",
            "top-right",
            "middle-left",
            "middle-right",
            "bottom-left",
            "bottom-center",
            "bottom-right",
          ]}
          boundBoxFunc={(_oldBox, newBox) => {
            if (Math.abs(newBox.width) < 20 || Math.abs(newBox.height) < 20)
              return _oldBox;
            return newBox;
          }}
        />
      )}
      {isSelected &&
        !element.locked &&
        element.shapeType === "path" &&
        element.pathPoints && (
          <Group
            x={element.x}
            y={element.y}
            rotation={element.rotation}
            name="path-editor"
          >
            {element.pathPoints.map((pt, i) => {
              const prevPt =
                i === 0
                  ? element.pathPoints![element.pathPoints!.length - 1]
                  : element.pathPoints![i - 1];
              return (
                <React.Fragment key={i}>
                  {/* Control point 1 (attached to previous point) */}
                  {pt.cp1x !== undefined && pt.cp1y !== undefined && (
                    <>
                      <Line
                        points={[prevPt.x, prevPt.y, pt.cp1x, pt.cp1y]}
                        stroke="#3b82f6"
                        strokeWidth={1}
                        dash={[4, 4]}
                      />
                      <Circle
                        x={pt.cp1x}
                        y={pt.cp1y}
                        radius={4}
                        fill="#ffffff"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        draggable
                        onDragMove={(e) => {
                          const newPts = [...element.pathPoints!];
                          newPts[i] = {
                            ...newPts[i],
                            cp1x: e.target.x(),
                            cp1y: e.target.y(),
                          };
                          onChange({ pathPoints: newPts });
                        }}
                      />
                    </>
                  )}
                  {/* Control point 2 (attached to current point) */}
                  {pt.cp2x !== undefined && pt.cp2y !== undefined && (
                    <>
                      <Line
                        points={[pt.x, pt.y, pt.cp2x, pt.cp2y]}
                        stroke="#3b82f6"
                        strokeWidth={1}
                        dash={[4, 4]}
                      />
                      <Circle
                        x={pt.cp2x}
                        y={pt.cp2y}
                        radius={4}
                        fill="#ffffff"
                        stroke="#3b82f6"
                        strokeWidth={1}
                        draggable
                        onDragMove={(e) => {
                          const newPts = [...element.pathPoints!];
                          newPts[i] = {
                            ...newPts[i],
                            cp2x: e.target.x(),
                            cp2y: e.target.y(),
                          };
                          onChange({ pathPoints: newPts });
                        }}
                      />
                    </>
                  )}
                  {/* Anchor point */}
                  <Circle
                    x={pt.x}
                    y={pt.y}
                    radius={6}
                    fill="#3b82f6"
                    stroke="#ffffff"
                    strokeWidth={2}
                    draggable
                    onDragMove={(e) => {
                      const newPts = [...element.pathPoints!];
                      const dx = e.target.x() - newPts[i].x;
                      const dy = e.target.y() - newPts[i].y;
                      newPts[i] = {
                        ...newPts[i],
                        x: e.target.x(),
                        y: e.target.y(),
                      };
                      // Move control points with anchor
                      if (newPts[i].cp2x !== undefined) {
                        newPts[i].cp2x! += dx;
                        newPts[i].cp2y! += dy;
                      }

                      // Also move cp1 of the NEXT point, since it's attached to this anchor
                      const nextIdx = (i + 1) % newPts.length;
                      if (newPts[nextIdx].cp1x !== undefined) {
                        newPts[nextIdx] = {
                          ...newPts[nextIdx],
                          cp1x: newPts[nextIdx].cp1x! + dx,
                          cp1y: newPts[nextIdx].cp1y! + dy,
                        };
                      }

                      onChange({ pathPoints: newPts });
                    }}
                  />
                </React.Fragment>
              );
            })}
          </Group>
        )}
    </>
  );
}

// ─── Main Interactive Canvas ────────────────────────────

export function InteractiveCanvas() {
  const ctx = useCanvasContext();
  const {
    state,
    updateElement,
    selectElement,
    deleteElement,
    setZoom,
    registerStageRef,
  } = ctx;

  const stageRef = useRef<Konva.Stage>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasCtxRef = useRef(ctx);
  useEffect(() => {
    canvasCtxRef.current = ctx;
  });

  // Register stage ref with context for export
  useEffect(() => {
    registerStageRef(stageRef.current);
    return () => registerStageRef(null);
  }, [registerStageRef]);

  const [containerSize, setContainerSize] = useState({ w: 600, h: 600 });

  // Measure container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Calculate scale to fit
  const scale = useMemo(() => {
    const padding = 60;
    const scaleX = (containerSize.w - padding * 2) / state.canvasWidth;
    const scaleY = (containerSize.h - padding * 2) / state.canvasHeight;
    return Math.min(scaleX, scaleY, 1) * state.zoom;
  }, [containerSize, state.canvasWidth, state.canvasHeight, state.zoom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      )
        return;
      if (
        (e.key === "Delete" || e.key === "Backspace") &&
        state.selectedElementId
      ) {
        deleteElement(state.selectedElementId);
      }
      if (e.key === "Escape") {
        selectElement(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [state.selectedElementId, deleteElement, selectElement]);

  // Mouse wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom(Math.max(0.25, Math.min(3, state.zoom + delta)));
      }
    };
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [state.zoom, setZoom]);

  const handleZoomIn = useCallback(() => {
    setZoom(Math.min(3, state.zoom + 0.1));
  }, [state.zoom, setZoom]);

  const handleZoomOut = useCallback(() => {
    setZoom(Math.max(0.25, state.zoom - 0.1));
  }, [state.zoom, setZoom]);

  const handleFitToScreen = useCallback(() => {
    setZoom(1);
  }, [setZoom]);

  // Handle file drop onto canvas
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      // Helper: compute canvas-relative coords from a client mouse position
      const getCanvasCoords = () => {
        const stageNode = stageRef.current;
        if (!stageNode) return { x: 100, y: 100 };
        const stageBox = stageNode.container().getBoundingClientRect();
        return {
          x: (e.clientX - stageBox.left) / scale,
          y: (e.clientY - stageBox.top) / scale,
        };
      };

      // 1. Handle editor element drops (shapes, text from the Elements panel)
      const editorPayload = e.dataTransfer.getData(
        "application/x-editor-element",
      );
      if (editorPayload) {
        try {
          const data = JSON.parse(editorPayload) as {
            elementType: string;
            shapeType?: string;
            preset?: string;
            emoji?: string;
            name?: string;
          };
          const { x, y } = getCanvasCoords();
          const { addElement } = canvasCtxRef.current;

          if (data.elementType === "shape" && data.shapeType) {
            addElement(
              createShapeElementFn(
                data.shapeType as ShapeElement["shapeType"],
                {
                  x: Math.max(0, x - 100),
                  y: Math.max(0, y - 100),
                },
              ),
            );
          } else if (
            data.elementType === "text" &&
            data.preset === "emoji" &&
            data.emoji
          ) {
            // Emoji drop — large emoji text element
            addElement(
              createTextElementFn({
                text: data.emoji,
                fontSize: 64,
                fontWeight: "normal",
                fontFamily:
                  "Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif",
                name: data.name || "Emoji",
                width: 80,
                height: 80,
                align: "center",
                x: Math.max(0, x - 40),
                y: Math.max(0, y - 40),
              }),
            );
          } else if (data.elementType === "text") {
            const presets: Record<
              string,
              {
                text: string;
                fontSize: number;
                fontWeight: "bold" | "normal";
                name: string;
              }
            > = {
              title: {
                text: "Título",
                fontSize: 48,
                fontWeight: "bold",
                name: "Título",
              },
              subtitle: {
                text: "Subtítulo",
                fontSize: 32,
                fontWeight: "bold",
                name: "Subtítulo",
              },
              body: {
                text: "Texto de cuerpo",
                fontSize: 18,
                fontWeight: "normal",
                name: "Texto",
              },
            };
            const p = presets[data.preset || "body"] || presets.body;
            addElement(
              createTextElementFn({
                ...p,
                x: Math.max(0, x - 150),
                y: Math.max(0, y - 30),
              }),
            );
          }
          return; // handled
        } catch {
          // fallthrough to other handlers
        }
      }

      // 2. Handle data URL drops (images from media panel)
      const dataUrl = e.dataTransfer.getData("text/plain");
      const name = e.dataTransfer.getData("text/name") || "Imagen";
      if (
        dataUrl &&
        (dataUrl.startsWith("data:") || dataUrl.startsWith("http"))
      ) {
        const { x, y } = getCanvasCoords();
        const { addElement } = canvasCtxRef.current;
        addElement(
          createImageElementFn(dataUrl, {
            x: Math.max(0, x - 100),
            y: Math.max(0, y - 100),
            width: 200,
            height: 200,
            name,
          }),
        );
        return;
      }

      // 3. Handle native file drops
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = () => {
            const src = reader.result as string;
            const { addImage: addImg } = canvasCtxRef.current;
            addImg(src, file.name);
          };
          reader.readAsDataURL(file);
        }
      }
    },
    [scale],
  );

  return (
    <div className="editor-canvas-area" ref={containerRef}>
      <div
        className="editor-canvas-workspace"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <div
          className="shadow-xl rounded-sm overflow-hidden"
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
                selectElement(null);
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

              {/* Elements rendered in order (z-index = array position) */}
              {state.elements
                .filter((el) => el.visible)
                .map((el) => {
                  if (el.type === "text") {
                    return (
                      <CanvasTextElement
                        key={el.id}
                        element={el as TextElement}
                        isSelected={state.selectedElementId === el.id}
                        onSelect={() => selectElement(el.id)}
                        onChange={(updates) => updateElement(el.id, updates)}
                      />
                    );
                  }
                  if (el.type === "image" || el.type === "watermark") {
                    return (
                      <CanvasImageElement
                        key={el.id}
                        element={el as ImageElement}
                        isSelected={state.selectedElementId === el.id}
                        onSelect={() => selectElement(el.id)}
                        onChange={(updates) => updateElement(el.id, updates)}
                      />
                    );
                  }
                  if (el.type === "shape") {
                    return (
                      <CanvasShapeElement
                        key={el.id}
                        element={el as ShapeElement}
                        isSelected={state.selectedElementId === el.id}
                        onSelect={() => selectElement(el.id)}
                        onChange={(updates) => updateElement(el.id, updates)}
                      />
                    );
                  }
                  return null;
                })}
            </Layer>
          </Stage>
        </div>

        {/* Empty state overlay */}
        {state.elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-sm text-gray-400 font-medium">
              Tu banner aparecerá aquí
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {state.canvasWidth}×{state.canvasHeight} px
            </p>
          </div>
        )}
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
          {Math.round(state.zoom * 100)}%
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
