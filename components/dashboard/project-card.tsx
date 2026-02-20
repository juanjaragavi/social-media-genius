"use client";

/**
 * ProjectCard — Card for a project in the dashboard
 *
 * Shows project name, post count, last modified, and action menu.
 */

import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  FileImage,
} from "lucide-react";

interface ProjectCardProps {
  id: string;
  name: string;
  postCount: number;
  updatedAt: string;
  onClick: (id: string) => void;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string) => void;
  /** Render as a horizontal list row instead of a card */
  variant?: "grid" | "list";
}

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

export function ProjectCard({
  id,
  name,
  postCount,
  updatedAt,
  onClick,
  onRename,
  onDelete,
  variant = "grid",
}: ProjectCardProps) {
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

  // ─── List variant ──────────────────────────────────────
  if (variant === "list") {
    return (
      <div className="group relative flex items-center gap-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all px-3 py-2.5">
        {/* Folder icon */}
        <button
          onClick={() => onClick(id)}
          className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-50 to-cyan-50 flex items-center justify-center shrink-0 cursor-pointer"
        >
          <Folder className="h-6 w-6 text-blue-400 fill-blue-100" />
        </button>

        {/* Name — full width, no truncation */}
        <button
          onClick={() => onClick(id)}
          className="flex-1 min-w-0 text-left cursor-pointer"
        >
          <h3 className="text-sm font-semibold text-gray-800">{name}</h3>
        </button>

        {/* Metadata */}
        <div className="flex items-center gap-3 text-[11px] text-gray-400 shrink-0">
          <span className="flex items-center gap-1">
            <FileImage className="h-3 w-3" />
            {postCount} {postCount === 1 ? "post" : "posts"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {relativeTime(updatedAt)}
          </span>
        </div>

        {/* Actions */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-md border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onRename(id, name);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                <Pencil className="h-3.5 w-3.5" /> Renombrar
              </button>
              <div className="h-px bg-gray-100 my-1" />
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(id);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Grid variant (default) ────────────────────────────
  return (
    <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md transition-all overflow-hidden">
      {/* Folder icon area */}
      <button
        onClick={() => onClick(id)}
        className="flex items-center justify-center py-8 bg-linear-to-br from-blue-50 to-cyan-50 cursor-pointer"
      >
        <Folder className="h-12 w-12 text-blue-400 fill-blue-100" />
      </button>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="text-sm font-semibold text-gray-800 truncate">{name}</h3>
        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <FileImage className="h-3 w-3" />
            {postCount} {postCount === 1 ? "post" : "posts"}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {relativeTime(updatedAt)}
          </span>
        </div>
      </div>

      {/* More actions */}
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
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={() => {
                setShowMenu(false);
                onRename(id, name);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              Renombrar
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
