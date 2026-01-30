'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlatformIconComponent } from '@/components/ui/platform-icons';
import { GeneratedPostData } from '@/types/generated-post';

interface PostResultProps {
  result: GeneratedPostData;
}

export function PostResult({ result }: PostResultProps) {
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageError, setImageError] = useState('');

  if (!result || !result.post) {
    return null;
  }

  const { post, usage, generationTimeMs } = result;

  const handleGenerateImage = async () => {
    if (!post.imagePrompt) return;

    setGeneratingImage(true);
    setImageError('');

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: post.imagePrompt,
          platform: result.platform || 'instagram',
          style: 'realistic',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al generar imagen');
      }

      setGeneratedImage(data.image.dataUrl);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Error al generar imagen');
    } finally {
      setGeneratingImage(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="w-7 h-7">{getPlatformIconComponent(result.platform || 'instagram')}</span>
          Publicación Generada
        </CardTitle>
        <CardDescription>
          Revisa y personaliza tu contenido generado con IA
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Generated Content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Contenido</span>
            <span className="text-xs text-gray-500">
              {post.metadata?.characterCount ?? 0} caracteres
            </span>
          </div>
          <div className="p-4 rounded-lg border border-gray-200 bg-linear-to-br from-lime-50/50 to-cyan-50/50">
            <p className="text-sm whitespace-pre-wrap text-gray-800">{post.content}</p>
          </div>
        </div>

        {/* Hashtags */}
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Hashtags</span>
              <span className="text-xs text-gray-500">
                {post.hashtags.length} etiquetas
              </span>
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
            <span className="text-sm font-medium text-gray-700">Prompt de Imagen</span>
            <div className="p-4 rounded-lg border border-gray-200 bg-linear-to-br from-blue-50/50 to-cyan-50/50">
              <p className="text-sm text-gray-700 mb-3">
                {post.imagePrompt}
              </p>
              <Button
                onClick={handleGenerateImage}
                disabled={generatingImage}
                size="sm"
                variant="outline"
                className="bg-linear-to-r from-lime-50 to-cyan-50 hover:from-lime-100 hover:to-cyan-100 text-lime-700 border-lime-200"
              >
                {generatingImage ? '🎨 Generando...' : '🎨 Generar Imagen'}
              </Button>
            </div>

            {imageError && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{imageError}</p>
              </div>
            )}

            {generatedImage && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImage}
                  alt="Generated social media image"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Video Prompt */}
        {post.videoPrompt && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">Prompt de Video</span>
            <div className="p-4 rounded-lg border border-gray-200 bg-linear-to-br from-cyan-50/50 to-blue-50/50">
              <p className="text-sm text-gray-700 mb-3">
                {post.videoPrompt}
              </p>
              <div className="p-3 rounded-md bg-amber-50 border border-amber-200">
                <p className="text-xs text-amber-700">
                  ⚠️ La generación de video con Veo 3.1 está actualmente en vista previa
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-500 mb-1">Engagement</div>
            <div className="text-sm font-medium capitalize text-gray-800">{post.metadata?.estimatedEngagement ?? 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Tipo de Contenido</div>
            <div className="text-sm font-medium capitalize text-gray-800">{post.metadata?.contentType ?? 'N/A'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Tiempo de Generación</div>
            <div className="text-sm font-medium text-gray-800">{((generationTimeMs ?? 0) / 1000).toFixed(2)}s</div>
          </div>
        </div>

        {/* Cost Information */}
        {usage && (
          <div className="p-3 rounded-lg bg-linear-to-r from-lime-50 to-cyan-50 border border-lime-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-lime-700">
                💰 Costo Estimado
              </span>
              <span className="text-sm font-bold text-lime-700">
                ${usage.estimatedCostUSD}
              </span>
            </div>
            <div className="mt-1 text-xs text-lime-600">
              {(usage.totalTokens ?? 0).toLocaleString()} tokens utilizados
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button
            onClick={() => navigator.clipboard.writeText(post.content + '\n\n' + (post.hashtags?.map((t: string) => `#${t}`).join(' ') ?? ''))}
            variant="outline"
            className="flex-1 bg-linear-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 text-blue-700 border-blue-200"
          >
            📋 Copiar Contenido
          </Button>
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="flex-1 bg-linear-to-r from-lime-50 to-cyan-50 hover:from-lime-100 hover:to-cyan-100 text-lime-700 border-lime-200"
          >
            🖨️ Imprimir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
