"use client";

import { Share2, Sparkles, LogOut } from "lucide-react";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";

export function Header() {
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      window.location.href = "/login";
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-linear-to-r from-lime-50 via-cyan-50 to-blue-50 backdrop-blur-md border-b border-lime-200/30 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Main Header Content */}
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="https://storage.googleapis.com/media-topfinanzas-com/images/topnetworks-positivo-sinfondo.webp"
                alt="TopNetworks Logo"
                width={280}
                height={88}
                className="h-12 w-auto"
                priority
              />
            </div>
            <div className="flex items-center gap-2">
              <Share2 className="h-6 w-6 text-lime-600" />
              <h1 className="text-xl font-bold bg-linear-to-r from-blue-600 via-cyan-600 to-lime-600 bg-clip-text text-transparent">
                Social Media Genius
              </h1>
              <Sparkles className="h-6 w-6 text-cyan-500" />
            </div>
          </div>

          {/* User Session + Badge */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex text-xs px-3 py-1.5 rounded-full bg-linear-to-r from-lime-100 to-cyan-100 text-lime-700 font-medium border border-lime-200">
              🤖 Impulsado por Gemini 2.5
            </span>

            {session?.user && (
              <div className="flex items-center gap-2">
                {session.user.image && (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "Usuario"}
                    width={32}
                    height={32}
                    className="rounded-full border border-gray-200"
                  />
                )}
                <span className="hidden sm:inline text-sm text-gray-700 font-medium max-w-30 truncate">
                  {session.user.name?.split(" ")[0]}
                </span>
                <button
                  onClick={handleSignOut}
                  disabled={signingOut}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Cerrar Sesión"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Subtitle - Always visible */}
        <div className="text-center mt-3">
          <h2 className="text-lg font-bold bg-linear-to-r from-blue-600 via-cyan-600 to-lime-600 bg-clip-text text-transparent">
            Generador de Banners Fotorrealistas para Redes Sociales
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Banners con IA • Editor Visual • Campañas Multi-Dimensión • ES / EN
            / PT-BR
          </p>
        </div>
      </div>
    </header>
  );
}
