"use client";

import { useState } from "react";
import Image from "next/image";
import { PostGenerator } from "@/components/post-generator";
import { PostResult } from "@/components/post-result";
import { GeneratedPostData } from "@/types/generated-post";
import { Header } from "@/components/ui/header";

export default function Home() {
  const [generatedPost, setGeneratedPost] = useState<GeneratedPostData | null>(
    null,
  );

  return (
    <>
      <Header />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main Generator Section */}
          <section id="generador" className="scroll-mt-24">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Generator Column */}
              <div>
                <PostGenerator onPostGenerated={setGeneratedPost} />
              </div>

              {/* Result Column */}
              <div>
                {generatedPost ? (
                  <PostResult result={generatedPost} />
                ) : (
                  <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-150 flex items-center justify-center">
                    <div className="text-center px-6 py-8 relative">
                      {/* Watermark */}
                      <div className="relative mb-6">
                        <Image
                          src="https://storage.googleapis.com/media-topfinanzas-com/favicon.png"
                          alt="TopNetworks Watermark"
                          width={150}
                          height={150}
                          className="opacity-20 grayscale select-none pointer-events-none mx-auto"
                          draggable={false}
                        />
                        <div className="absolute inset-0 bg-linear-to-b from-transparent via-white/30 to-white/40 rounded-full"></div>
                      </div>
                      <p className="text-gray-400 text-lg font-medium mb-6">
                        Tu publicación aparecerá aquí
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-500 max-w-sm mx-auto">
                        <div className="p-3 bg-linear-to-br from-lime-50 to-cyan-50 rounded-lg border border-lime-100">
                          <div className="font-semibold mb-1 text-lime-700">
                            ✅ Contenido
                          </div>
                          <div className="text-gray-600">
                            Texto optimizado por plataforma
                          </div>
                        </div>
                        <div className="p-3 bg-linear-to-br from-cyan-50 to-blue-50 rounded-lg border border-cyan-100">
                          <div className="font-semibold mb-1 text-cyan-700">
                            🏷️ Hashtags
                          </div>
                          <div className="text-gray-600">
                            Etiquetas en tendencia
                          </div>
                        </div>
                        <div className="p-3 bg-linear-to-br from-blue-50 to-lime-50 rounded-lg border border-blue-100">
                          <div className="font-semibold mb-1 text-blue-700">
                            🎨 Imágenes
                          </div>
                          <div className="text-gray-600">
                            Visuales generados con IA
                          </div>
                        </div>
                        <div className="p-3 bg-linear-to-br from-lime-50 to-cyan-50 rounded-lg border border-lime-100">
                          <div className="font-semibold mb-1 text-lime-700">
                            💰 Bajo Costo
                          </div>
                          <div className="text-gray-600">
                            ~$0.0002 por publicación
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2 text-gray-800">Súper Rápido</h3>
              <p className="text-sm text-gray-600">
                Genera contenido optimizado por plataforma en segundos con
                Gemini 2.5 Flash
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="font-semibold mb-2 text-gray-800">
                Específico por Plataforma
              </h3>
              <p className="text-sm text-gray-600">
                Contenido personalizado para Instagram, Twitter, Facebook,
                TikTok y LinkedIn
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="font-semibold mb-2 text-gray-800">
                Generación de Medios
              </h3>
              <p className="text-sm text-gray-600">
                Generación de imágenes con IA usando Imagen 4.0 Ultra
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 border-t border-lime-200/30 bg-linear-to-r from-lime-50 via-cyan-50 to-blue-50">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>
              Impulsado por Google Vertex AI • Gemini 2.5 Flash • Imagen 4.0
              Ultra • Veo 3.1
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
