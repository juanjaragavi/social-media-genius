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
  OutputLocale,
  BannerDimensionPreset,
} from "@/types/social-platforms";
import { GeneratedPostData } from "@/types/generated-post";
import { BANNER_DIMENSIONS } from "@/types/editor";
import { LOCALES, UI_LABELS } from "@/lib/i18n/translations";

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
  const [includeImage, setIncludeImage] = useState(true);
  const [imageStyle, setImageStyle] = useState<ImageStyle>("professional");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Multilanguage
  const [outputLocale, setOutputLocale] = useState<OutputLocale>("ES");

  // Banner dimensions
  const [selectedDimension, setSelectedDimension] =
    useState<BannerDimensionPreset>(BANNER_DIMENSIONS[0]);

  // Campaign mode
  const [campaignMode, setCampaignMode] = useState(false);
  const [campaignDimensions, setCampaignDimensions] = useState<
    BannerDimensionPreset[]
  >([BANNER_DIMENSIONS[0], BANNER_DIMENSIONS[3], BANNER_DIMENSIONS[5]]);

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

  const handleCampaignDimensionChange = (index: number, dimLabel: string) => {
    const dimension = BANNER_DIMENSIONS.find((d) => d.label === dimLabel);
    if (dimension) {
      const updated = [...campaignDimensions];
      updated[index] = dimension;
      setCampaignDimensions(updated);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError("Por favor ingresa un tema");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const requestBody = {
        platform,
        postType,
        topic,
        tone,
        contentLength,
        includeHashtags,
        includeImage,
        imageStyle,
        additionalInstructions: additionalInstructions.trim() || undefined,
        outputLocale,
        bannerWidth: selectedDimension.width,
        bannerHeight: selectedDimension.height,
        bannerAspectRatio: selectedDimension.aspectRatio,
        campaignMode,
        campaignDimensions: campaignMode ? campaignDimensions : undefined,
      };

      const response = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar el banner");
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
        <CardTitle className="flex items-center gap-2">
          <span>🎨</span>
          Generar Banner para Redes Sociales
        </CardTitle>
        <CardDescription>
          Crea banners fotorrealistas optimizados por plataforma con IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Output Language Selection */}
        <div className="space-y-2">
          <Label>{UI_LABELS.outputLanguage} *</Label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(LOCALES) as OutputLocale[]).map((locale) => (
              <button
                key={locale}
                onClick={() => setOutputLocale(locale)}
                className={`p-2.5 rounded-lg border-2 transition-all flex items-center justify-center gap-2 text-sm ${
                  outputLocale === locale
                    ? "border-lime-500 bg-linear-to-br from-lime-50 to-cyan-50 shadow-sm font-medium"
                    : "border-gray-200 hover:border-lime-300 hover:bg-lime-50/50"
                }`}
              >
                <span>{LOCALES[locale].flag}</span>
                <span>{LOCALES[locale].label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Platform Selection */}
        <div className="space-y-2">
          <Label>{UI_LABELS.platform} *</Label>
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

        {/* Banner Dimensions */}
        <div className="space-y-2">
          <Label>{UI_LABELS.bannerDimensions} *</Label>
          <select
            value={selectedDimension.label}
            onChange={(e) => {
              const dim = BANNER_DIMENSIONS.find(
                (d) => d.label === e.target.value,
              );
              if (dim) setSelectedDimension(dim);
            }}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
          >
            {BANNER_DIMENSIONS.map((dim) => (
              <option key={dim.label} value={dim.label}>
                {dim.label} {dim.platform ? `(${dim.platform})` : ""}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="px-2 py-0.5 bg-lime-50 rounded border border-lime-200 text-lime-700">
              {selectedDimension.width}×{selectedDimension.height} px
            </span>
            <span className="px-2 py-0.5 bg-cyan-50 rounded border border-cyan-200 text-cyan-700">
              {selectedDimension.aspectRatio}
            </span>
          </div>
        </div>

        {/* Campaign Mode Toggle */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="campaignMode"
              checked={campaignMode}
              onChange={(e) => setCampaignMode(e.target.checked)}
              className="h-4 w-4 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
            />
            <Label
              htmlFor="campaignMode"
              className="text-sm font-medium text-gray-700 cursor-pointer"
            >
              {UI_LABELS.campaignMode}
            </Label>
          </div>
          {campaignMode && (
            <div className="ml-6 space-y-3 p-3 rounded-lg bg-linear-to-br from-lime-50/50 to-cyan-50/50 border border-lime-200">
              <p className="text-xs text-gray-600">
                {UI_LABELS.campaignDescription}
              </p>
              {[
                UI_LABELS.primaryDimension,
                UI_LABELS.secondaryDimension,
                UI_LABELS.tertiaryDimension,
              ].map((dimensionLabel, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-xs">{dimensionLabel}</Label>
                  <select
                    value={
                      campaignDimensions[index]?.label ||
                      BANNER_DIMENSIONS[0].label
                    }
                    onChange={(e) =>
                      handleCampaignDimensionChange(index, e.target.value)
                    }
                    className="flex h-9 w-full rounded-md border border-gray-200 bg-white px-3 py-1 text-xs focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
                  >
                    {BANNER_DIMENSIONS.map((dim) => (
                      <option key={dim.label} value={dim.label}>
                        {dim.label} {dim.platform ? `(${dim.platform})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Topic Input */}
        <div className="space-y-2">
          <Label htmlFor="topic">{UI_LABELS.topic} *</Label>
          <Input
            id="topic"
            placeholder={UI_LABELS.topicPlaceholder}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        {/* Post Type */}
        <div className="space-y-2">
          <Label htmlFor="postType">{UI_LABELS.postType} *</Label>
          <select
            id="postType"
            value={postType}
            onChange={(e) => setPostType(e.target.value as PostType)}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
          >
            {postTypes.map((type) => (
              <option key={type} value={type}>
                {UI_LABELS.postTypeLabels[type]}
              </option>
            ))}
          </select>
        </div>

        {/* Tone */}
        <div className="space-y-2">
          <Label htmlFor="tone">{UI_LABELS.tone}</Label>
          <select
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value as Tone)}
            className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
          >
            {tones.map((t) => (
              <option key={t} value={t}>
                {UI_LABELS.toneLabels[t]}
              </option>
            ))}
          </select>
        </div>

        {/* Content Length */}
        <div className="space-y-2">
          <Label>{UI_LABELS.contentLength}</Label>
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
                {UI_LABELS.contentLengthLabels[length]}
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
              {UI_LABELS.includeHashtags}
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
              {UI_LABELS.generateImage}
            </Label>
          </div>

          {includeImage && (
            <div className="ml-6 space-y-2">
              <Label htmlFor="imageStyle">{UI_LABELS.imageStyle}</Label>
              <select
                id="imageStyle"
                value={imageStyle}
                onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
                className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:border-lime-400 focus:ring-1 focus:ring-lime-400"
              >
                {imageStyles.map((style) => (
                  <option key={style} value={style}>
                    {UI_LABELS.imageStyleLabels[style]}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Additional Instructions */}
        <div className="space-y-2">
          <Label htmlFor="instructions">
            {UI_LABELS.additionalInstructions} (Opcional)
          </Label>
          <Textarea
            id="instructions"
            placeholder={UI_LABELS.additionalInstructionsHint}
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
              <span className="text-white">
                {campaignMode
                  ? UI_LABELS.creatingCampaign
                  : UI_LABELS.generatingBanner}
              </span>
            </>
          ) : (
            <>
              <span className="mr-2">✨</span>
              <span className="text-white">
                {campaignMode
                  ? UI_LABELS.createCampaign
                  : UI_LABELS.generateBanner}
              </span>
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
