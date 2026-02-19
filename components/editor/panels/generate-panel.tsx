"use client";

import React, { useState } from "react";
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
import type { GeneratedPostData } from "@/types/generated-post";
import { BANNER_DIMENSIONS } from "@/types/editor";
import { LOCALES, UI_LABELS } from "@/lib/i18n/translations";

interface GeneratePanelProps {
  onPostGenerated: (post: GeneratedPostData) => void;
  selectedDimension: BannerDimensionPreset;
  onDimensionChange: (dim: BannerDimensionPreset) => void;
  isGenerating: boolean;
  onGeneratingChange: (loading: boolean) => void;
}

const PLATFORMS: Platform[] = [
  "instagram",
  "twitter",
  "facebook",
  "tiktok",
  "linkedin",
];

const POST_TYPES: PostType[] = [
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

const TONES: Tone[] = [
  "casual",
  "professional",
  "friendly",
  "urgent",
  "inspiring",
  "humorous",
  "empathetic",
  "authoritative",
];

const CONTENT_LENGTHS: ContentLength[] = ["short", "medium", "long"];

const IMAGE_STYLES: ImageStyle[] = [
  "product-photo",
  "lifestyle",
  "infographic",
  "illustration",
  "minimalist",
  "vibrant",
  "professional",
  "candid",
];

export function GeneratePanel({
  onPostGenerated,
  selectedDimension,
  onDimensionChange,
  isGenerating,
  onGeneratingChange,
}: GeneratePanelProps) {
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [postType, setPostType] = useState<PostType>("promotional");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState<Tone>("casual");
  const [contentLength, setContentLength] = useState<ContentLength>("medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [includeImage, setIncludeImage] = useState(true);
  const [imageStyle, setImageStyle] = useState<ImageStyle>("professional");
  const [additionalInstructions, setAdditionalInstructions] = useState("");
  const [outputLocale, setOutputLocale] = useState<OutputLocale>("ES");
  const [error, setError] = useState("");

  // Campaign mode
  const [campaignMode, setCampaignMode] = useState(false);
  const [campaignDimensions, setCampaignDimensions] = useState<
    BannerDimensionPreset[]
  >([BANNER_DIMENSIONS[0], BANNER_DIMENSIONS[3], BANNER_DIMENSIONS[5]]);

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

    onGeneratingChange(true);
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
      onGeneratingChange(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Output Language */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.outputLanguage}
        </Label>
        <div className="grid grid-cols-3 gap-1.5">
          {(Object.keys(LOCALES) as OutputLocale[]).map((locale) => (
            <button
              key={locale}
              onClick={() => setOutputLocale(locale)}
              className={`editor-panel-chip ${outputLocale === locale ? "active" : ""}`}
            >
              <span>{LOCALES[locale].flag}</span>
              <span className="text-[11px]">{LOCALES[locale].label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Selection */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.platform}
        </Label>
        <div className="grid grid-cols-5 gap-1.5">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`editor-panel-platform-chip ${platform === p ? "active" : ""}`}
              title={p}
            >
              <div className="flex items-center justify-center">
                {getPlatformIconComponent(p)}
              </div>
              <div className="text-[9px] font-medium capitalize text-gray-600 leading-none mt-0.5">
                {p === "twitter"
                  ? "X"
                  : p.charAt(0).toUpperCase() + p.slice(1, 5)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Banner Dimensions */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.bannerDimensions}
        </Label>
        <select
          value={selectedDimension.label}
          onChange={(e) => {
            const dim = BANNER_DIMENSIONS.find(
              (d) => d.label === e.target.value,
            );
            if (dim) onDimensionChange(dim);
          }}
          className="editor-panel-select"
        >
          {BANNER_DIMENSIONS.map((dim) => (
            <option key={dim.label} value={dim.label}>
              {dim.label} {dim.platform ? `(${dim.platform})` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Topic Input */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.topic} *
        </Label>
        <Input
          placeholder={UI_LABELS.topicPlaceholder}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="editor-panel-input"
        />
      </div>

      {/* Post Type */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.postType}
        </Label>
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value as PostType)}
          className="editor-panel-select"
        >
          {POST_TYPES.map((type) => (
            <option key={type} value={type}>
              {UI_LABELS.postTypeLabels[type]}
            </option>
          ))}
        </select>
      </div>

      {/* Tone */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.tone}
        </Label>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value as Tone)}
          className="editor-panel-select"
        >
          {TONES.map((t) => (
            <option key={t} value={t}>
              {UI_LABELS.toneLabels[t]}
            </option>
          ))}
        </select>
      </div>

      {/* Content Length */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.contentLength}
        </Label>
        <div className="grid grid-cols-3 gap-1.5">
          {CONTENT_LENGTHS.map((length) => (
            <button
              key={length}
              onClick={() => setContentLength(length)}
              className={`editor-panel-chip ${contentLength === length ? "active" : ""}`}
            >
              {UI_LABELS.contentLengthLabels[length]}
            </button>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="panel-hashtags"
            checked={includeHashtags}
            onChange={(e) => setIncludeHashtags(e.target.checked)}
            className="h-3.5 w-3.5 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
          />
          <label
            htmlFor="panel-hashtags"
            className="text-xs text-gray-600 cursor-pointer"
          >
            {UI_LABELS.includeHashtags}
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="panel-image"
            checked={includeImage}
            onChange={(e) => setIncludeImage(e.target.checked)}
            className="h-3.5 w-3.5 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
          />
          <label
            htmlFor="panel-image"
            className="text-xs text-gray-600 cursor-pointer"
          >
            {UI_LABELS.generateImage}
          </label>
        </div>

        {includeImage && (
          <div className="ml-5 space-y-1.5">
            <Label className="text-xs font-medium text-gray-600">
              {UI_LABELS.imageStyle}
            </Label>
            <select
              value={imageStyle}
              onChange={(e) => setImageStyle(e.target.value as ImageStyle)}
              className="editor-panel-select"
            >
              {IMAGE_STYLES.map((style) => (
                <option key={style} value={style}>
                  {UI_LABELS.imageStyleLabels[style]}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Campaign Mode */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="panel-campaign"
            checked={campaignMode}
            onChange={(e) => setCampaignMode(e.target.checked)}
            className="h-3.5 w-3.5 text-lime-600 border-gray-300 rounded focus:ring-lime-500"
          />
          <label
            htmlFor="panel-campaign"
            className="text-xs text-gray-600 cursor-pointer font-medium"
          >
            {UI_LABELS.campaignMode}
          </label>
        </div>
        {campaignMode && (
          <div className="ml-5 space-y-2 p-2.5 rounded-lg bg-lime-50/50 border border-lime-200">
            <p className="text-[10px] text-gray-500">
              {UI_LABELS.campaignDescription}
            </p>
            {[
              UI_LABELS.primaryDimension,
              UI_LABELS.secondaryDimension,
              UI_LABELS.tertiaryDimension,
            ].map((label, index) => (
              <div key={index} className="space-y-0.5">
                <Label className="text-[10px]">{label}</Label>
                <select
                  value={
                    campaignDimensions[index]?.label ||
                    BANNER_DIMENSIONS[0].label
                  }
                  onChange={(e) =>
                    handleCampaignDimensionChange(index, e.target.value)
                  }
                  className="editor-panel-select text-[11px] h-8"
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

      {/* Additional Instructions */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-gray-600">
          {UI_LABELS.additionalInstructions}
        </Label>
        <Textarea
          placeholder={UI_LABELS.additionalInstructionsHint}
          value={additionalInstructions}
          onChange={(e) => setAdditionalInstructions(e.target.value)}
          rows={2}
          className="editor-panel-textarea"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-2 rounded-md bg-red-50 border border-red-200">
          <p className="text-[11px] text-red-600">{error}</p>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="editor-generate-btn"
      >
        {isGenerating ? (
          <>
            <span className="animate-spin">⚡</span>
            <span>
              {campaignMode
                ? UI_LABELS.creatingCampaign
                : UI_LABELS.generatingBanner}
            </span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>
              {campaignMode
                ? UI_LABELS.createCampaign
                : UI_LABELS.generateBanner}
            </span>
          </>
        )}
      </button>
    </div>
  );
}
