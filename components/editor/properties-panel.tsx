"use client";

import React, { useState, useCallback } from "react";
import {
  Download,
  Copy,
  Check,
  Paintbrush,
  Hash,
  FileText,
  BarChart3,
  DollarSign,
  Clock,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { getPlatformIconComponent } from "@/components/ui/platform-icons";
import type { GeneratedPostData } from "@/types/generated-post";
import { UI_LABELS, LOCALES, type OutputLocale } from "@/lib/i18n/translations";

interface PropertiesPanelProps {
  generatedPost: GeneratedPostData | null;
  onOpenEditor?: (imageUrl?: string, width?: number, height?: number) => void;
  onClose: () => void;
}

function InlineCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
      title="Copiar"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-lime-600" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
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

export function PropertiesPanel({
  generatedPost,
  onOpenEditor,
  onClose,
}: PropertiesPanelProps) {
  if (!generatedPost || !generatedPost.post) return null;

  const { post, usage, generationTimeMs } = generatedPost;
  const locale = (generatedPost.outputLocale as OutputLocale) || "ES";
  const localeConfig = LOCALES[locale];

  return (
    <div className="editor-properties-panel">
      {/* Header */}
      <div className="editor-properties-header">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5">
            {getPlatformIconComponent(generatedPost.platform || "instagram")}
          </span>
          <h3 className="text-sm font-semibold text-gray-800">Resultado</h3>
          {localeConfig && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {localeConfig.flag}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="editor-properties-content">
        {/* Banner actions */}
        {generatedPost.banner?.dataUrl && (
          <div className="editor-prop-section">
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  downloadDataUrl(
                    generatedPost.banner!.dataUrl!,
                    `banner-${generatedPost.platform}-${Date.now()}.png`,
                  )
                }
                className="editor-prop-action-btn flex-1"
              >
                <Download className="h-3.5 w-3.5" />
                Descargar
              </button>
              {onOpenEditor && (
                <button
                  onClick={() =>
                    onOpenEditor(
                      generatedPost.banner!.dataUrl!,
                      generatedPost.banner?.width,
                      generatedPost.banner?.height,
                    )
                  }
                  className="editor-prop-action-btn flex-1"
                >
                  <Paintbrush className="h-3.5 w-3.5" />
                  Editar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Campaign banners */}
        {generatedPost.campaignBanners &&
          generatedPost.campaignBanners.length > 0 && (
            <div className="editor-prop-section">
              <div className="editor-prop-label">
                <ImageIcon className="h-3.5 w-3.5" />
                Campaña ({generatedPost.campaignBanners.length})
              </div>
              <div className="space-y-2">
                {generatedPost.campaignBanners.map((banner, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded bg-gray-50 border border-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {banner.dataUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={banner.dataUrl}
                          alt={banner.label}
                          className="w-8 h-8 rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="text-xs font-medium text-gray-700">
                          {banner.label}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {banner.width}×{banner.height}
                        </div>
                      </div>
                    </div>
                    {banner.dataUrl && (
                      <button
                        onClick={() =>
                          downloadDataUrl(
                            banner.dataUrl!,
                            `campaign-${banner.aspectRatio.replace(":", "x")}-${Date.now()}.png`,
                          )
                        }
                        className="p-1 rounded hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Content text */}
        <div className="editor-prop-section">
          <div className="flex items-center justify-between">
            <div className="editor-prop-label">
              <FileText className="h-3.5 w-3.5" />
              Contenido
            </div>
            <InlineCopyButton text={post.content} />
          </div>
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
              {post.content}
            </p>
          </div>
          <div className="text-[10px] text-gray-400 mt-1">
            {post.metadata?.characterCount ?? 0} caracteres
          </div>
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="editor-prop-section">
            <div className="flex items-center justify-between">
              <div className="editor-prop-label">
                <Hash className="h-3.5 w-3.5" />
                Hashtags ({post.hashtags.length})
              </div>
              <InlineCopyButton
                text={post.hashtags.map((t: string) => `#${t}`).join(" ")}
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-0.5 rounded-full bg-lime-50 text-lime-700 text-[11px] border border-lime-200"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Image prompt */}
        {post.imagePrompt && (
          <div className="editor-prop-section">
            <div className="flex items-center justify-between">
              <div className="editor-prop-label">
                <ImageIcon className="h-3.5 w-3.5" />
                Prompt de Imagen
              </div>
              <InlineCopyButton text={post.imagePrompt} />
            </div>
            <div className="p-2.5 rounded-lg bg-blue-50/50 border border-blue-100">
              <p className="text-[11px] text-blue-700 leading-relaxed">
                {post.imagePrompt}
              </p>
            </div>
          </div>
        )}

        {/* Video prompt */}
        {post.videoPrompt && (
          <div className="editor-prop-section">
            <div className="flex items-center justify-between">
              <div className="editor-prop-label">
                <FileText className="h-3.5 w-3.5" />
                Prompt de Video
              </div>
              <InlineCopyButton text={post.videoPrompt} />
            </div>
            <div className="p-2.5 rounded-lg bg-cyan-50/50 border border-cyan-100">
              <p className="text-[11px] text-cyan-700 leading-relaxed">
                {post.videoPrompt}
              </p>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="editor-prop-section">
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 rounded bg-gray-50 border border-gray-100 text-center">
              <BarChart3 className="h-3 w-3 text-gray-400 mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-400 mb-0.5">Engagement</div>
              <div className="text-xs font-medium text-gray-700 capitalize">
                {post.metadata?.estimatedEngagement ?? "N/A"}
              </div>
            </div>
            <div className="p-2 rounded bg-gray-50 border border-gray-100 text-center">
              <FileText className="h-3 w-3 text-gray-400 mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-400 mb-0.5">Tipo</div>
              <div className="text-xs font-medium text-gray-700 capitalize">
                {post.metadata?.contentType ?? "N/A"}
              </div>
            </div>
            <div className="p-2 rounded bg-gray-50 border border-gray-100 text-center">
              <Clock className="h-3 w-3 text-gray-400 mx-auto mb-0.5" />
              <div className="text-[10px] text-gray-400 mb-0.5">Tiempo</div>
              <div className="text-xs font-medium text-gray-700">
                {((generationTimeMs ?? 0) / 1000).toFixed(1)}s
              </div>
            </div>
          </div>
        </div>

        {/* Cost */}
        {usage && (
          <div className="editor-prop-section">
            <div className="p-2.5 rounded-lg bg-linear-to-r from-lime-50 to-cyan-50 border border-lime-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-lime-700 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Costo
                </span>
                <span className="text-xs font-bold text-lime-700">
                  ${usage.estimatedCostUSD}
                </span>
              </div>
              <div className="text-[10px] text-lime-600 mt-0.5">
                {(usage.totalTokens ?? 0).toLocaleString()} tokens
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
