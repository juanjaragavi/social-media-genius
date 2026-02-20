"use client";

/**
 * PostCard — Thumbnail card for a post in the dashboard
 *
 * Renders thumbnail, title, platform badge, aspect ratio,
 * relative timestamp, and hover action controls.
 */

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  Clock,
  MoreHorizontal,
  Pencil,
  FolderInput,
  Trash2,
  ExternalLink,
} from "lucide-react";
import {
  InstagramIcon,
  TwitterIcon,
  FacebookIcon,
  TiktokIcon,
  LinkedinIcon,
} from "@/components/ui/platform-icons";

interface PostCardProps {
  id: string;
  title: string;
  platform: string | null;
  aspectRatio: string | null;
  thumbnailUrl: string | null;
  updatedAt: string;
  onOpen: (id: string) => void;
  onRename: (id: string, currentTitle: string) => void;
  onMoveToProject: (id: string) => void;
  onDelete: (id: string) => void;
}

const platformIconMap: Record<string, React.ReactNode> = {
  instagram: <InstagramIcon className="h-3.5 w-3.5" />,
  twitter: <TwitterIcon className="h-3.5 w-3.5" />,
  facebook: <FacebookIcon className="h-3.5 w-3.5" />,
  tiktok: <TiktokIcon className="h-3.5 w-3.5" />,
  linkedin: <LinkedinIcon className="h-3.5 w-3.5" />,
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Hace ${days}d`;
  const months = Math.floor(days / 30);
  return `Hace ${months}m`;
}

export function PostCard({
  id,
  title,
  platform,
  aspectRatio,
  thumbnailUrl,
  updatedAt,
  onOpen,
  onRename,
  onMoveToProject,
  onDelete,
}: PostCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all overflow-hidden">
      {/* Thumbnail */}
      <button
        onClick={() => onOpen(id)}
        className="relative aspect-square w-full bg-gray-100 overflow-hidden cursor-pointer"
      >
        {thumbnailUrl ? (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-300">
            <svg
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-gray-700 shadow-sm">
            <ExternalLink className="h-3 w-3" />
            Abrir
          </span>
        </div>
      </button>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-gray-800 truncate">
          {title}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          {platform && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-medium text-gray-600 capitalize">
              {platformIconMap[platform]}
              {platform === "twitter" ? "X" : platform}
            </span>
          )}
          {aspectRatio && (
            <span className="px-1.5 py-0.5 bg-cyan-50 rounded text-[10px] font-medium text-cyan-700 border border-cyan-100">
              {aspectRatio}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-auto">
          <Clock className="h-3 w-3" />
          {relativeTime(updatedAt)}
        </div>
      </div>

      {/* More actions button */}
      <div className="absolute top-2 right-2 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 rounded-md bg-white/80 backdrop-blur-sm border border-gray-200 text-gray-500 hover:bg-white hover:text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        {showMenu && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => {
                setShowMenu(false);
                onOpen(id);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Abrir
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                onRename(id, title);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Renombrar
            </button>
            <button
              onClick={() => {
                setShowMenu(false);
                onMoveToProject(id);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <FolderInput className="h-3.5 w-3.5" />
              Mover a proyecto
            </button>
            <div className="h-px bg-gray-100 my-1" />
            <button
              onClick={() => {
                setShowMenu(false);
                onDelete(id);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Eliminar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
