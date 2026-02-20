"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type {
  AnyEditorElement,
  TextElement,
  ImageElement,
  ShapeElement,
  EditorState,
} from "@/types/editor";

// ─── Helper constructors ─────────────────────────────────

export function createTextElement(
  overrides?: Partial<TextElement>,
): TextElement {
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
    ...overrides,
  };
}

export function createImageElement(
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

export function createShapeElement(
  shapeType: ShapeElement["shapeType"],
  overrides?: Partial<ShapeElement>,
): ShapeElement {
  return {
    id: uuidv4(),
    type: "shape",
    x: 100,
    y: 100,
    width: 200,
    height: 200,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    name:
      shapeType === "rect"
        ? "Rectángulo"
        : shapeType === "circle"
          ? "Círculo"
          : shapeType === "triangle"
            ? "Triángulo"
            : shapeType === "star"
              ? "Estrella"
              : "Línea",
    zIndex: 0,
    shapeType,
    fill: "#3b82f6",
    stroke: "#1d4ed8",
    strokeWidth: 2,
    cornerRadius: shapeType === "rect" ? 8 : undefined,
    ...overrides,
  };
}

// ─── Context type ────────────────────────────────────────

interface CanvasContextType {
  state: EditorState;
  // Element operations
  addElement: (element: AnyEditorElement) => void;
  updateElement: (id: string, updates: Partial<AnyEditorElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElement: (id: string, direction: "up" | "down") => void;
  selectElement: (id: string | null) => void;
  // Convenience adders
  addText: (preset?: "title" | "subtitle" | "body") => void;
  addImage: (src: string, name?: string) => void;
  addShape: (shapeType: ShapeElement["shapeType"]) => void;
  // Canvas operations
  setCanvasSize: (width: number, height: number) => void;
  setBackgroundColor: (color: string) => void;
  setZoom: (zoom: number) => void;
  setBackgroundImage: (dataUrl: string) => void;
  // Selected element helper
  selectedElement: AnyEditorElement | undefined;
  // Uploaded files
  uploadedFiles: UploadedFile[];
  addUploadedFile: (file: UploadedFile) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  dataUrl: string;
  size: number;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

export function useCanvasContext() {
  const ctx = useContext(CanvasContext);
  if (!ctx)
    throw new Error("useCanvasContext must be used within CanvasProvider");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────

interface CanvasProviderProps {
  children: React.ReactNode;
  initialWidth?: number;
  initialHeight?: number;
}

export function CanvasProvider({
  children,
  initialWidth = 1080,
  initialHeight = 1080,
}: CanvasProviderProps) {
  const [state, setState] = useState<EditorState>({
    elements: [],
    selectedElementId: null,
    canvasWidth: initialWidth,
    canvasHeight: initialHeight,
    backgroundColor: "#ffffff",
    zoom: 1,
    history: [],
    historyIndex: -1,
  });

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

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

  const selectElement = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, selectedElementId: id }));
  }, []);

  const addText = useCallback(
    (preset?: "title" | "subtitle" | "body") => {
      const presets = {
        title: {
          text: "Título",
          fontSize: 48,
          fontWeight: "bold" as const,
          name: "Título",
        },
        subtitle: {
          text: "Subtítulo",
          fontSize: 32,
          fontWeight: "bold" as const,
          name: "Subtítulo",
        },
        body: {
          text: "Texto de cuerpo",
          fontSize: 18,
          fontWeight: "normal" as const,
          name: "Texto",
        },
      };
      const p = presets[preset || "body"];
      addElement(createTextElement(p));
    },
    [addElement],
  );

  const addImage = useCallback(
    (src: string, name?: string) => {
      addElement(
        createImageElement(src, {
          width: state.canvasWidth * 0.5,
          height: state.canvasHeight * 0.5,
          x: state.canvasWidth * 0.25,
          y: state.canvasHeight * 0.25,
          name: name || "Imagen",
        }),
      );
    },
    [addElement, state.canvasWidth, state.canvasHeight],
  );

  const addShape = useCallback(
    (shapeType: ShapeElement["shapeType"]) => {
      addElement(
        createShapeElement(shapeType, {
          x: state.canvasWidth / 2 - 100,
          y: state.canvasHeight / 2 - 100,
        }),
      );
    },
    [addElement, state.canvasWidth, state.canvasHeight],
  );

  const setCanvasSize = useCallback((width: number, height: number) => {
    setState((prev) => ({ ...prev, canvasWidth: width, canvasHeight: height }));
  }, []);

  const setBackgroundColor = useCallback((color: string) => {
    setState((prev) => ({ ...prev, backgroundColor: color }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setState((prev) => ({ ...prev, zoom }));
  }, []);

  const setBackgroundImage = useCallback((dataUrl: string) => {
    setState((prev) => {
      // Check if there's already a background image element
      const bgIndex = prev.elements.findIndex(
        (el) => el.type === "image" && el.name === "Fondo",
      );
      if (bgIndex >= 0) {
        const newElements = [...prev.elements];
        newElements[bgIndex] = {
          ...newElements[bgIndex],
          src: dataUrl,
        } as ImageElement;
        return { ...prev, elements: newElements };
      }
      // Add new background image at position 0
      return {
        ...prev,
        elements: [
          createImageElement(dataUrl, {
            width: prev.canvasWidth,
            height: prev.canvasHeight,
            x: 0,
            y: 0,
            name: "Fondo",
          }),
          ...prev.elements,
        ],
      };
    });
  }, []);

  const addUploadedFile = useCallback((file: UploadedFile) => {
    setUploadedFiles((prev) => [...prev, file]);
  }, []);

  const selectedElement = state.elements.find(
    (el) => el.id === state.selectedElementId,
  );

  return (
    <CanvasContext.Provider
      value={{
        state,
        addElement,
        updateElement,
        deleteElement,
        duplicateElement,
        moveElement,
        selectElement,
        addText,
        addImage,
        addShape,
        setCanvasSize,
        setBackgroundColor,
        setZoom,
        setBackgroundImage,
        selectedElement,
        uploadedFiles,
        addUploadedFile,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}
