"use client";

import React, { useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlatformIconComponent } from "@/components/ui/platform-icons";
import { GeneratedPostData } from "@/types/generated-post";
import { UI_LABELS, LOCALES, type OutputLocale } from "@/lib/i18n/translations";
import {
  Copy,
  Check,
  Download,
  Paintbrush,
  Printer,
  Image as ImageIcon,
} from "lucide-react";

interface PostResultProps {
  result: GeneratedPostData;
  onOpenEditor?: (imageUrl?: string, width?: number, height?: number) => void;
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1 px-2 py-1 text-xs rounded-md border transition-all hover:bg-lime-50 hover:border-lime-300 border-gray-200 text-gray-600 hover:text-lime-700"
      title={label}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-lime-600" />
          <span className="text-lime-600">{UI_LABELS.copied}</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function PostResult({ result, onOpenEditor }: PostResultProps) {
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState("");

  if (!result || !result.post) {
    return null;
  }

  const { post, usage, generationTimeMs } = result;
  const locale = (result.outputLocale as OutputLocale) || "ES";
  const localeConfig = LOCALES[locale];

  const handleGenerateImage = async () => {
    if (!post.imagePrompt) return;

    setGeneratingImage(true);
    setImageError("");

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: post.imagePrompt,
          platform: result.platform || "instagram",
          style: "realistic",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al generar imagen");
      }

      setGeneratedImage(data.image.dataUrl);
    } catch (err) {
      setImageError(
        err instanceof Error ? err.message : "Error al generar imagen",
      );
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-7 h-7">
            {getPlatformIconComponent(result.platform || "instagram")}
          </span>
          {UI_LABELS.generatedBanner}
          {localeConfig && (
            <span className="ml-auto text-sm font-normal px-2 py-0.5 rounded bg-gray-100 text-gray-600">
              {localeConfig.flag} {localeConfig.nativeName}
            </span>
          )}
        </CardTitle>
        <CardDescription>
          Revisa y personaliza tu banner generado con IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Banner Image (if available) */}
        {result.banner?.dataUrl && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Banner</span>
              <div className="flex items-center gap-2">
                {result.banner.width && result.banner.height && (
                  <span className="text-xs px-2 py-0.5 bg-lime-50 rounded border border-lime-200 text-lime-700">
                    {result.banner.width}×{result.banner.height}
                  </span>
                )}
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={result.banner.dataUrl}
              alt="Generated banner"
              className="w-full rounded-lg shadow-lg border border-gray-200"
            />
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  downloadDataUrl(
                    result.banner!.dataUrl!,
                    `banner-${result.platform}-${Date.now()}.png`,
                  )
                }
                variant="outline"
                size="sm"
                className="bg-linear-to-r from-lime-50 to-cyan-50 hover:from-lime-100 hover:to-cyan-100 text-lime-700 border-lime-200"
              >
                <Download className="h-4 w-4 mr-1" />
                {UI_LABELS.downloadImage}
              </Button>
              {onOpenEditor && (
                <Button
                  onClick={() =>
                    onOpenEditor(
                      result.banner!.dataUrl!,
                      result.banner?.width,
                      result.banner?.height,
                    )
                  }
                  variant="outline"
                  size="sm"
                  className="bg-linear-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-blue-200"
                >
                  <Paintbrush className="h-4 w-4 mr-1" />
                  {UI_LABELS.editInEditor}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Campaign Banners */}
        {result.campaignBanners && result.campaignBanners.length > 0 && (
          <div className="space-y-4">
            <span className="text-sm font-medium text-gray-700">
              Banners de Campaña ({result.campaignBanners.length})
            </span>
            <div className="grid gap-4">
              {result.campaignBanners.map((banner, index) => (
                <div
                  key={index}
                  className="space-y-2 p-3 rounded-lg border border-gray-200 bg-gray-50/50"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      {banner.label}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-lime-50 rounded border border-lime-200 text-lime-700">
                      {banner.width}×{banner.height}
                    </span>
                  </div>
                  {banner.dataUrl && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={banner.dataUrl}
                        alt={`Campaign banner ${banner.label}`}
                        className="w-full rounded-lg shadow border border-gray-200"
                      />
                      <Button
                        onClick={() =>
                          downloadDataUrl(
                            banner.dataUrl!,
                            `banner-campaign-${banner.aspectRatio.replace(":", "x")}-${Date.now()}.png`,
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="w-full bg-linear-to-r from-lime-50 to-cyan-50 hover:from-lime-100 hover:to-cyan-100 text-lime-700 border-lime-200"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        {UI_LABELS.downloadImage}
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Generated Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              {UI_LABELS.content}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {post.metadata?.characterCount ?? 0} caracteres
              </span>
              <CopyButton text={post.content} label={UI_LABELS.copyContent} />
            </div>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-linear-to-br from-lime-50/50 to-cyan-50/50">
            <p className="text-sm whitespace-pre-wrap text-gray-800">
              {post.content}
            </p>
          </div>
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {UI_LABELS.hashtags}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {post.hashtags.length} etiquetas
                </span>
                <CopyButton
                  text={post.hashtags.map((t: string) => `#${t}`).join(" ")}
                  label={UI_LABELS.copyHashtags}
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {post.hashtags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-linear-to-r from-lime-100 to-cyan-100 text-lime-700 text-sm border border-lime-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Image Prompt */}
        {post.imagePrompt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {UI_LABELS.imagePrompt}
              </span>
              <CopyButton
                text={post.imagePrompt}
                label={UI_LABELS.copyImagePrompt}
              />
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-linear-to-br from-blue-50/50 to-cyan-50/50">
              <p className="text-sm text-gray-700 mb-3">{post.imagePrompt}</p>
              {!generatedImage && !result.banner?.dataUrl && (
                <Button
                  onClick={handleGenerateImage}
                  disabled={generatingImage}
                  size="sm"
                  variant="outline"
                  className="bg-linear-to-r from-lime-50 to-cyan-50 hover:from-lime-100 hover:to-cyan-100 text-lime-700 border-lime-200"
                >
                  {generatingImage ? (
                    <>
                      <ImageIcon className="h-4 w-4 mr-1 animate-pulse" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Generar Imagen
                    </>
                  )}
                </Button>
              )}
            </div>

            {imageError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{imageError}</p>
              </div>
            )}

            {generatedImage && (
              <div className="mt-4 space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImage}
                  alt="Generated social media image"
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() =>
                      downloadDataUrl(
                        generatedImage,
                        `image-${result.platform}-${Date.now()}.png`,
                      )
                    }
                    variant="outline"
                    size="sm"
                    className="bg-linear-to-r from-lime-50 to-cyan-50 hover:from-lime-100 hover:to-cyan-100 text-lime-700 border-lime-200"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    {UI_LABELS.downloadImage}
                  </Button>
                  {onOpenEditor && (
                    <Button
                      onClick={() => onOpenEditor(generatedImage)}
                      variant="outline"
                      size="sm"
                      className="bg-linear-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-blue-200"
                    >
                      <Paintbrush className="h-4 w-4 mr-1" />
                      {UI_LABELS.editInEditor}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Video Prompt */}
        {post.videoPrompt && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                {UI_LABELS.videoPrompt}
              </span>
              <CopyButton
                text={post.videoPrompt}
                label={UI_LABELS.copyImagePrompt}
              />
            </div>
            <div className="p-4 rounded-lg border border-gray-200 bg-linear-to-br from-cyan-50/50 to-blue-50/50">
              <p className="text-sm text-gray-700 mb-3">{post.videoPrompt}</p>
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700">
                  ⚠️ La generación de video con Veo 3.1 está actualmente en
                  vista previa
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {UI_LABELS.engagement}
            </div>
            <div className="text-sm font-medium capitalize text-gray-800">
              {post.metadata?.estimatedEngagement ?? "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {UI_LABELS.contentType}
            </div>
            <div className="text-sm font-medium capitalize text-gray-800">
              {post.metadata?.contentType ?? "N/A"}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">
              {UI_LABELS.generationTime}
            </div>
            <div className="text-sm font-medium text-gray-800">
              {((generationTimeMs ?? 0) / 1000).toFixed(2)}s
            </div>
          </div>
        </div>

        {/* Cost Information */}
        {usage && (
          <div className="p-3 rounded-lg bg-linear-to-r from-lime-50 to-cyan-50 border border-lime-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-lime-700">
                💰 {UI_LABELS.estimatedCost}
              </span>
              <span className="text-sm font-bold text-lime-700">
                ${usage.estimatedCostUSD}
              </span>
            </div>
            <div className="mt-1 text-xs text-lime-600">
              {(usage.totalTokens ?? 0).toLocaleString()} {UI_LABELS.tokensUsed}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() =>
              navigator.clipboard.writeText(
                post.content +
                  "\n\n" +
                  (post.hashtags?.map((t: string) => `#${t}`).join(" ") ?? ""),
              )
            }
            variant="outline"
            className="flex-1 bg-linear-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-blue-200"
          >
            <Copy className="h-4 w-4 mr-1" />
            {UI_LABELS.copyContent}
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1 bg-linear-to-r from-lime-50 to-cyan-50 hover:from-lime-100 hover:to-cyan-100 text-lime-700 border-lime-200"
          >
            <Printer className="h-4 w-4 mr-1" />
            {UI_LABELS.print}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
