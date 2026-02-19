"use client";

import React from "react";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import { useState } from "react";
import { Share2, Sparkles, LogOut, Download, Undo2, Redo2 } from "lucide-react";
import type { BannerDimension } from "@/types/editor";

interface TopToolbarProps {
  selectedDimension: BannerDimension;
  hasGeneratedContent: boolean;
  onExport?: () => void;
}

export function TopToolbar({
  selectedDimension,
  hasGeneratedContent,
  onExport,
}: TopToolbarProps) {
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
    <header className="editor-top-toolbar">
      {/* Left section — Logo & Project */}
      <div className="flex items-center gap-3 min-w-0">
        <Image
          src="https://storage.googleapis.com/media-topfinanzas-com/images/topnetworks-positivo-sinfondo.webp"
          alt="TopNetworks Logo"
          width={160}
          height={50}
          className="h-8 w-auto shrink-0"
          priority
        />
        <div className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-700">
          <Share2 className="h-4 w-4 text-lime-600" />
          <span className="bg-linear-to-r from-blue-600 via-cyan-600 to-lime-600 bg-clip-text text-transparent">
            Social Media Genius
          </span>
          <Sparkles className="h-4 w-4 text-cyan-500" />
        </div>
      </div>

      {/* Center section — Context info */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
            title="Deshacer"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors"
            title="Rehacer"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        <div className="h-5 w-px bg-gray-200 hidden sm:block" />
        <span className="text-xs px-2 py-1 bg-lime-50 rounded border border-lime-200 text-lime-700 font-medium">
          {selectedDimension.width}×{selectedDimension.height}
        </span>
        <span className="text-xs px-2 py-1 bg-cyan-50 rounded border border-cyan-200 text-cyan-700 font-medium">
          {selectedDimension.aspectRatio}
        </span>
      </div>

      {/* Right section — Actions & User */}
      <div className="flex items-center gap-2">
        <span className="hidden lg:inline-flex text-xs px-2.5 py-1 rounded-full bg-linear-to-r from-lime-100 to-cyan-100 text-lime-700 font-medium border border-lime-200">
          🤖 Gemini 2.5
        </span>

        {hasGeneratedContent && onExport && (
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-cyan-600 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        )}

        {session?.user && (
          <div className="flex items-center gap-2 ml-1">
            {session.user.image && (
              <Image
                src={session.user.image}
                alt={session.user.name || "Usuario"}
                width={28}
                height={28}
                className="rounded-full border border-gray-200"
              />
            )}
            <span className="hidden md:inline text-xs text-gray-600 font-medium max-w-25 truncate">
              {session.user.name?.split(" ")[0]}
            </span>
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
              title="Cerrar Sesión"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
