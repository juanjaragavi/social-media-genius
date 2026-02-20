"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSession, signOut } from "@/lib/auth-client";
import {
  Share2,
  Sparkles,
  LogOut,
  Download,
  Undo2,
  Redo2,
  ChevronDown,
  HardDrive,
  CloudUpload,
  Loader2,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  ArrowLeft,
} from "lucide-react";
import type { BannerDimension } from "@/types/editor";
import type { ExportDestination, ShareTarget } from "./editor-layout";

interface TopToolbarProps {
  selectedDimension: BannerDimension;
  hasGeneratedContent: boolean;
  onExport?: (destination: ExportDestination) => void;
  onShare?: (target: ShareTarget) => void;
  isExporting?: boolean;
  exportMessage?: string | null;
  /** Post title — shown as editable inline field when present */
  postTitle?: string;
  /** Called when the user finishes editing the post title */
  onPostTitleChange?: (title: string) => void;
  /** Show a back-to-dashboard link */
  showBackLink?: boolean;
}

export function TopToolbar({
  selectedDimension,
  hasGeneratedContent,
  onExport,
  onShare,
  isExporting,
  exportMessage,
  postTitle,
  onPostTitleChange,
  showBackLink,
}: TopToolbarProps) {
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(postTitle ?? "");
  const titleInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
      if (
        shareMenuRef.current &&
        !shareMenuRef.current.contains(e.target as Node)
      ) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
      {/* Left section — Back link, Logo & Project */}
      <div className="flex items-center gap-3 min-w-0">
        {showBackLink && (
          <a
            href="/dashboard"
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            title="Volver al panel"
          >
            <ArrowLeft className="h-4 w-4" />
          </a>
        )}
        <Image
          src="https://storage.googleapis.com/media-topfinanzas-com/images/topnetworks-positivo-sinfondo.webp"
          alt="TopNetworks Logo"
          width={160}
          height={50}
          className="h-8 w-auto shrink-0"
          priority
        />
        {postTitle !== undefined ? (
          /* Editable post title */
          editingTitle ? (
            <input
              ref={titleInputRef}
              className="text-sm font-semibold text-gray-700 bg-white border border-blue-300 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-blue-200 max-w-48"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                if (titleDraft.trim() && titleDraft !== postTitle) {
                  onPostTitleChange?.(titleDraft.trim());
                } else {
                  setTitleDraft(postTitle ?? "");
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                if (e.key === "Escape") {
                  setTitleDraft(postTitle ?? "");
                  setEditingTitle(false);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors truncate max-w-48 cursor-pointer"
              onClick={() => {
                setTitleDraft(postTitle ?? "");
                setEditingTitle(true);
              }}
              title="Clic para renombrar"
            >
              {postTitle || "Sin título"}
            </button>
          )
        ) : (
          <div className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            <Share2 className="h-4 w-4 text-lime-600" />
            <span className="bg-linear-to-r from-blue-600 via-cyan-600 to-lime-600 bg-clip-text text-transparent">
              Social Media Genius
            </span>
            <Sparkles className="h-4 w-4 text-cyan-500" />
          </div>
        )}
      </div>

      {/* Center section — Context info */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
            title="Deshacer"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            className="p-1.5 rounded hover:bg-gray-100 text-gray-400 transition-colors cursor-pointer"
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

        {/* Export message toast */}
        {exportMessage && (
          <span className="text-xs px-2 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded font-medium animate-pulse max-w-48 truncate">
            {exportMessage}
          </span>
        )}

        {/* Share button */}
        {hasGeneratedContent && onShare && (
          <div className="relative" ref={shareMenuRef}>
            <button
              onClick={() => {
                setShowShareMenu(!showShareMenu);
                setShowExportMenu(false);
              }}
              disabled={isExporting}
              className="flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all border border-gray-200 cursor-pointer disabled:opacity-50"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compartir</span>
            </button>

            {showShareMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => {
                    onShare("facebook");
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Facebook className="h-3.5 w-3.5 text-blue-600" />
                  Facebook
                </button>
                <button
                  onClick={() => {
                    onShare("twitter");
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Twitter className="h-3.5 w-3.5 text-sky-500" />X (Twitter)
                </button>
                <button
                  onClick={() => {
                    onShare("linkedin");
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Linkedin className="h-3.5 w-3.5 text-blue-700" />
                  LinkedIn
                </button>
                <button
                  onClick={() => {
                    onShare("whatsapp");
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-green-600" />
                  WhatsApp
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => {
                    onShare("email");
                    setShowShareMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <Mail className="h-3.5 w-3.5 text-gray-500" />
                  Email
                </button>
              </div>
            )}
          </div>
        )}

        {/* Export button with dropdown */}
        {hasGeneratedContent && onExport && (
          <div className="relative" ref={exportMenuRef}>
            <div className="flex items-center">
              <button
                onClick={() => onExport("disk")}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-cyan-600 rounded-l-lg hover:from-blue-700 hover:to-cyan-700 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Exportar</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(!showExportMenu);
                  setShowShareMenu(false);
                }}
                disabled={isExporting}
                className="flex items-center px-1.5 py-1.5 text-white bg-linear-to-r from-cyan-600 to-cyan-700 rounded-r-lg hover:from-cyan-700 hover:to-cyan-800 transition-all shadow-sm border-l border-cyan-500 disabled:opacity-50 cursor-pointer"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                <button
                  onClick={() => {
                    onExport("disk");
                    setShowExportMenu(false);
                  }}
                  disabled={isExporting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <HardDrive className="h-3.5 w-3.5 text-gray-500" />
                  Guardar en disco
                </button>
                <button
                  onClick={() => {
                    onExport("drive");
                    setShowExportMenu(false);
                  }}
                  disabled={isExporting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <CloudUpload className="h-3.5 w-3.5 text-blue-500" />
                  Guardar en Google Drive
                </button>
              </div>
            )}
          </div>
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
