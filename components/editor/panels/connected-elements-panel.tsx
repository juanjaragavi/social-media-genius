"use client";

import React, { useCallback, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCanvasContext, createTextElement } from "../canvas-context";
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
  Search,
  Loader2,
  ArrowLeft,
  X,
} from "lucide-react";

// ─── Types for API results ────────────────────────────────

interface UnsplashPhoto {
  id: string;
  thumb: string;
  small: string;
  regular: string;
  alt: string;
  author: string;
  authorUrl: string;
}

interface IconifySticker {
  id: string;
  name: string;
  prefix: string;
  svgUrl: string;
  previewUrl: string;
}

interface EmojiItem {
  emoji: string;
  name: string;
  category: string;
}

type SubPanel = "fotos" | "stickers" | "emojis" | null;

// ─── Shape map ────────────────────────────────────────────

const SHAPE_MAP: Record<string, ShapeElement["shapeType"]> = {
  Rectángulo: "rect",
  Círculo: "circle",
  Triángulo: "triangle",
  Estrella: "star",
  Línea: "line",
};

/**
 * ConnectedElementsPanel wraps the elements sidebar and connects it
 * to the shared CanvasContext so that clicking a shape/element
 * actually adds it to the interactive canvas. Items are also draggable
 * onto the canvas to drop at a specific position.
 *
 * Now includes sub-panels for Fotos (Unsplash), Stickers (Iconify),
 * and Emojis (static dataset).
 */
export function ConnectedElementsPanel() {
  const { addShape, addImage, addElement } = useCanvasContext();

  const [activeSubPanel, setActiveSubPanel] = useState<SubPanel>(null);

  const handleShapeClick = useCallback(
    (name: string) => {
      const shapeType = SHAPE_MAP[name];
      if (shapeType) {
        addShape(shapeType);
      }
    },
    [addShape],
  );

  /** Serialize element info for drag-and-drop onto the canvas */
  const handleDragStart = useCallback(
    (
      e: React.DragEvent,
      elementType: string,
      meta?: Record<string, string>,
    ) => {
      const payload = JSON.stringify({ elementType, ...meta });
      e.dataTransfer.setData("application/x-editor-element", payload);
      e.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  /** Handle image drag start (photos, stickers) */
  const handleImageDragStart = useCallback(
    (e: React.DragEvent, url: string, name: string) => {
      e.dataTransfer.setData("text/plain", url);
      e.dataTransfer.setData("text/name", name);
      e.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  /** Handle emoji drag start */
  const handleEmojiDragStart = useCallback(
    (e: React.DragEvent, emoji: string, name: string) => {
      const payload = JSON.stringify({
        elementType: "text",
        preset: "emoji",
        emoji,
        name,
      });
      e.dataTransfer.setData("application/x-editor-element", payload);
      e.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  // If a sub-panel is active, render it
  if (activeSubPanel === "fotos") {
    return (
      <PhotosSubPanel
        onBack={() => setActiveSubPanel(null)}
        onSelectPhoto={(photo) => {
          addImage(photo.regular, `Foto: ${photo.alt}`);
        }}
        onDragStart={handleImageDragStart}
      />
    );
  }

  if (activeSubPanel === "stickers") {
    return (
      <StickersSubPanel
        onBack={() => setActiveSubPanel(null)}
        onSelectSticker={(sticker) => {
          addImage(sticker.svgUrl, `Sticker: ${sticker.name}`);
        }}
        onDragStart={handleImageDragStart}
      />
    );
  }

  if (activeSubPanel === "emojis") {
    return (
      <EmojisSubPanel
        onBack={() => setActiveSubPanel(null)}
        onSelectEmoji={(item) => {
          addElement(
            createTextElement({
              text: item.emoji,
              fontSize: 64,
              fontFamily:
                "Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif",
              fontWeight: "normal",
              name: item.name,
              width: 80,
              height: 80,
              align: "center",
            }),
          );
        }}
        onDragStart={handleEmojiDragStart}
      />
    );
  }

  // Main elements panel
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
        {(
          [
            {
              icon: Shapes,
              label: "Formas",
              action: () => addShape("rect"),
              dragType: "shape",
              dragMeta: { shapeType: "rect" } as Record<string, string>,
              subPanel: null as SubPanel,
            },
            {
              icon: ImageIcon,
              label: "Fotos",
              action: () => setActiveSubPanel("fotos"),
              dragType: "",
              dragMeta: {} as Record<string, string>,
              subPanel: "fotos" as SubPanel,
            },
            {
              icon: Sticker,
              label: "Stickers",
              action: () => setActiveSubPanel("stickers"),
              dragType: "",
              dragMeta: {} as Record<string, string>,
              subPanel: "stickers" as SubPanel,
            },
            {
              icon: Smile,
              label: "Emojis",
              action: () => setActiveSubPanel("emojis"),
              dragType: "",
              dragMeta: {} as Record<string, string>,
              subPanel: "emojis" as SubPanel,
            },
            {
              icon: Square,
              label: "Marcos",
              action: () => addShape("rect"),
              dragType: "shape",
              dragMeta: { shapeType: "rect" } as Record<string, string>,
              subPanel: null as SubPanel,
            },
            {
              icon: Star,
              label: "Íconos",
              action: () => setActiveSubPanel("stickers"),
              dragType: "",
              dragMeta: {} as Record<string, string>,
              subPanel: "stickers" as SubPanel,
            },
          ] as const
        ).map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
              onClick={cat.action}
              draggable={!!cat.dragType}
              onDragStart={(e) =>
                cat.dragType
                  ? handleDragStart(
                      e,
                      cat.dragType,
                      cat.dragMeta as Record<string, string>,
                    )
                  : undefined
              }
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
                draggable
                onDragStart={(e) =>
                  handleDragStart(e, "shape", {
                    shapeType: SHAPE_MAP[item.name] || "rect",
                  })
                }
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
            { icon: Smile, name: "Emojis", panel: "emojis" as SubPanel },
            { icon: Star, name: "Stickers", panel: "stickers" as SubPanel },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => setActiveSubPanel(item.panel)}
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

// ─── Photos Sub-Panel (Unsplash) ─────────────────────────

function PhotosSubPanel({
  onBack,
  onSelectPhoto,
  onDragStart,
}: {
  onBack: () => void;
  onSelectPhoto: (photo: UnsplashPhoto) => void;
  onDragStart: (e: React.DragEvent, url: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [photos, setPhotos] = useState<UnsplashPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const fetchPhotos = useCallback(async (q: string, p: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/assets/photos?query=${encodeURIComponent(q || "social media")}&page=${p}&per_page=20`,
      );
      const data = await res.json();
      if (p === 1) {
        setPhotos(data.results || []);
      } else {
        setPhotos((prev) => [...prev, ...(data.results || [])]);
      }
      setTotalPages(data.totalPages || 0);
    } catch {
      console.error("Failed to fetch photos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPhotos("social media", 1);
  }, [fetchPhotos]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchPhotos(query, 1);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchPhotos]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700">Fotos</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar fotos..."
          className="editor-panel-input pl-8 pr-8"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-2 gap-1.5 max-h-96 overflow-y-auto">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => onSelectPhoto(photo)}
            draggable
            onDragStart={(e) =>
              onDragStart(e, photo.regular, `Foto: ${photo.alt}`)
            }
            className="aspect-square rounded-md overflow-hidden border border-gray-100 hover:border-blue-300 transition-colors cursor-pointer group relative"
            title={photo.alt}
          >
            <Image
              src={photo.thumb}
              alt={photo.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
              width={200}
              height={200}
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/50 to-transparent p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-[8px] text-white truncate block">
                {photo.author}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      )}

      {/* Load more */}
      {!loading && page < totalPages && (
        <button
          onClick={() => {
            const next = page + 1;
            setPage(next);
            fetchPhotos(query, next);
          }}
          className="w-full text-xs text-blue-600 hover:text-blue-700 font-medium py-1.5 cursor-pointer"
        >
          Cargar más fotos
        </button>
      )}

      {/* Unsplash attribution */}
      <p className="text-[9px] text-gray-400 text-center">
        Fotos por{" "}
        <a
          href="https://unsplash.com?utm_source=social_media_genius&utm_medium=referral"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Unsplash
        </a>
      </p>
    </div>
  );
}

// ─── Stickers Sub-Panel (Iconify) ────────────────────────

function StickersSubPanel({
  onBack,
  onSelectSticker,
  onDragStart,
}: {
  onBack: () => void;
  onSelectSticker: (sticker: IconifySticker) => void;
  onDragStart: (e: React.DragEvent, url: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [stickers, setStickers] = useState<IconifySticker[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);

  const fetchStickers = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/assets/stickers?query=${encodeURIComponent(q || "social media")}&limit=30`,
      );
      const data = await res.json();
      setStickers(data.results || []);
    } catch {
      console.error("Failed to fetch stickers");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchStickers("social media");
  }, [fetchStickers]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchStickers(query);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchStickers]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700">Stickers</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar stickers..."
          className="editor-panel-input pl-8 pr-8"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-4 gap-2 max-h-96 overflow-y-auto">
        {stickers.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => onSelectSticker(sticker)}
            draggable
            onDragStart={(e) =>
              onDragStart(e, sticker.svgUrl, `Sticker: ${sticker.name}`)
            }
            className="aspect-square rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 flex items-center justify-center transition-colors cursor-pointer p-2"
            title={sticker.name}
          >
            <Image
              src={sticker.previewUrl}
              alt={sticker.name}
              className="w-8 h-8 object-contain"
              loading="lazy"
              width={32}
              height={32}
              unoptimized
            />
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      )}

      {!loading && stickers.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          No se encontraron stickers. Intenta otra búsqueda.
        </p>
      )}

      <p className="text-[9px] text-gray-400 text-center">
        Íconos por{" "}
        <a
          href="https://iconify.design"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Iconify
        </a>
      </p>
    </div>
  );
}

// ─── Emojis Sub-Panel (Static dataset) ───────────────────

function EmojisSubPanel({
  onBack,
  onSelectEmoji,
  onDragStart,
}: {
  onBack: () => void;
  onSelectEmoji: (item: EmojiItem) => void;
  onDragStart: (e: React.DragEvent, emoji: string, name: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [emojis, setEmojis] = useState<EmojiItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmojis = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const url = q
        ? `/api/assets/emojis?query=${encodeURIComponent(q)}`
        : "/api/assets/emojis";
      const res = await fetch(url);
      const data = await res.json();
      setEmojis(data.results || []);
    } catch {
      console.error("Failed to fetch emojis");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchEmojis("");
  }, [fetchEmojis]);

  // Search with debounce
  const debounceRef = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchEmojis(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, fetchEmojis]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded hover:bg-gray-100 text-gray-500 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-gray-700">Emojis</span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar emojis..."
          className="editor-panel-input pl-8 pr-8"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Emoji grid */}
      <div className="grid grid-cols-6 gap-1 max-h-96 overflow-y-auto">
        {emojis.map((item, idx) => (
          <button
            key={`${item.emoji}-${idx}`}
            onClick={() => onSelectEmoji(item)}
            draggable
            onDragStart={(e) => onDragStart(e, item.emoji, item.name)}
            className="aspect-square rounded-md hover:bg-blue-50 border border-transparent hover:border-blue-200 flex items-center justify-center transition-colors cursor-pointer text-xl"
            title={item.name}
          >
            {item.emoji}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        </div>
      )}

      {!loading && emojis.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-4">
          No se encontraron emojis.
        </p>
      )}
    </div>
  );
}
