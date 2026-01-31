"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getPlatformIconComponent } from "@/components/ui/platform-icons";
import type {
  Platform,
  PostType,
  Tone,
  ContentLength,
  ImageStyle,
} from "@/types/social-platforms";
import { GeneratedPostData } from "@/types/generated-post";

interface PostGeneratorProps {
  onPostGenerated: (post: GeneratedPostData) => void;
}

export function PostGenerator({ onPostGenerated }: PostGeneratorProps) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [postType, setPostType] = useState<PostType>("promotional");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("casual");
  const [contentLength, setContentLength] = useState<ContentLength>("medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeImage, setIncludeImage] = useState(false);
  const [imageStyle, setImageStyle] = useState<ImageStyle>("professional");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const platforms: Platform[] = [
    "instagram",
    "twitter",
    "facebook",
    "tiktok",
    "linkedin",
  ];
  const postTypes: PostType[] = [
    "promotional",
    "educational",
    "entertaining",
    "news",
    "announcement",
    "behind-the-scenes",
    "user-generated",
    "poll",
    "question",
  ];
  const tones: Tone[] = [
    "casual",
    "professional",
    "friendly",
    "urgent",
    "inspiring",
    "humorous",
    "empathetic",
    "authoritative",
  ];
  const contentLengths: ContentLength[] = ["short", "medium", "long"];
  const imageStyles: ImageStyle[] = [
    "product-photo",
    "lifestyle",
    "infographic",
    "illustration",
    "minimalist",
    "vibrant",
    "professional",
    "candid",
  ];

  // Spanish translations for UI
  const postTypeLabels: Record<PostType, string> = {
    promotional: "Promocional",
    educational: "Educativo",
    entertaining: "Entretenido",
    news: "Noticias",
    announcement: "Anuncio",
    "behind-the-scenes": "Detrás de Cámaras",
    "user-generated": "Contenido de Usuario",
    poll: "Encuesta",
    question: "Pregunta",
  };

  const toneLabels: Record<Tone, string> = {
    casual: "Casual",
    professional: "Profesional",
    friendly: "Amigable",
    urgent: "Urgente",
    inspiring: "Inspirador",
    humorous: "Humorístico",
    empathetic: "Empático",
    authoritative: "Con Autoridad",
  };

  const contentLengthLabels: Record<ContentLength, string> = {
    short: "Corto",
    medium: "Medio",
    long: "Largo",
  };

  const imageStyleLabels: Record<ImageStyle, string> = {
    "product-photo": "Foto de Producto",
    lifestyle: "Estilo de Vida",
    infographic: "Infografía",
    illustration: "Ilustración",
    minimalist: "Minimalista",
    vibrant: "Vibrante",
    professional: "Profesional",
    candid: "Espontáneo",
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Por favor ingresa un tema");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          postType,
          topic,
          tone,
          contentLength,
          includeHashtags,
          includeImage,
          imageStyle,
          additionalInstructions: additionalInstructions.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar la publicación");
      }

      onPostGenerated(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generar Publicación para Redes Sociales</CardTitle>
        <CardDescription>
          Crea contenido optimizado por plataforma con generación impulsada por
          IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Platform Selection */}
        <div className="space-y-2">
          <Label>Plataforma *</Label>
          <div className="grid grid-cols-5 gap-2">
            {platforms.map((p) => (
              <button
                key={p}
                onClick={() => setPlatform(p)}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center justify-center text-center ${
                  platform === p
                    ? "border-lime-500 bg-linear-to-br from-lime-50 to-cyan-50 shadow-sm"
                    : "border-gray-200 hover:border-lime-300 hover:bg-lime-50/50"
                }`}
              >
                <div className="flex items-center justify-center mb-1.5">
                  {getPlatformIconComponent(p)}
                </div>
                <div className="text-xs font-medium capitalize text-gray-700">
                  {p}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <Label htmlFor="topic">Tema *</Label>
          <Input
            id="topic"
            placeholder="ej., Lanzamiento de producto, Noticias..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* Post Type */}
        <div className="space-y-2">
          <Label htmlFor="postType">Tipo de Publicación *</Label>
          <select
            id="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value as PostType)}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
          >
            {postTypes.map((type) => (
              <option key={type} value={type}>
                {postTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label htmlFor="tone">Tono</Label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
          >
            {tones.map((t) => (
              <option key={t} value={t}>
                {toneLabels[t]}
              </option>
            ))}
          </select>
        </div>

        {/* Content Length */}
        <div className="space-y-2">
          <Label>Longitud del Contenido</Label>
          <div className="grid grid-cols-3 gap-2">
            {contentLengths.map((length) => (
              <button
                key={length}
                onClick={() => setContentLength(length)}
                className={`p-2 rounded-md border-2 text-sm transition-all ${
                  contentLength === length
                    ? "border-lime-500 bg-linear-to-r from-lime-50 to-cyan-50 text-lime-700 font-medium"
                    : "border-gray-200 hover:border-lime-300 hover:bg-lime-50/50"
                }`}
              >
                {contentLengthLabels[length]}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="hashtags"
              checked={includeHashtags}
              onChange={(e) => setIncludeHashtags(e.target.checked)}
              className="h-4 w-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
            />
            <Label
              htmlFor="hashtags"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Incluir hashtags
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="image"
              checked={includeImage}
              onChange={(e) => setIncludeImage(e.target.checked)}
              className="h-4 w-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
            />
            <Label
              htmlFor="image"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              Generar imagen con IA
            </Label>
          </div>

          {includeImage && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="imageStyle">Estilo de Imagen</Label>
              <select
                id="imageStyle"
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
              >
                {imageStyles.map((style) => (
                  <option key={style} value={style}>
                    {imageStyleLabels[style]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Additional Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions">
            Instrucciones Adicionales (Opcional)
          </Label>
          <Textarea
            id="instructions"
            placeholder="Cualquier requisito o guía específica..."
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            rows={3}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-linear-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold transition-all duration-200 shadow-md"
          size="lg"
        >
          {loading ? (
            <>
              <span className="mr-2 animate-spin">⚡</span>
              <span className="text-white">Generando Publicación...</span>
            </>
          ) : (
            <>
              <span className="mr-2">✨</span>
              <span className="text-white">Generar Publicación</span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
