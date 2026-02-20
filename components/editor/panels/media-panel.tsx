"use client";

import React, { useState, useCallback, useRef } from "react";
import { Upload, ImageIcon, FolderOpen } from "lucide-react";

export function MediaPanel() {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    // TODO: handle dropped files
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar archivos"
          className="editor-panel-input pl-3 pr-8"
        />
      </div>

      {/* Upload area */}
      <div
        className={`editor-upload-zone ${dragOver ? "active" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-8 w-8 text-gray-400 mb-2" />
        <p className="text-xs font-medium text-gray-500 mb-1">
          Arrastra archivos aquí
        </p>
        <p className="text-[10px] text-gray-400">o haz clic para buscar</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple
        />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-colors">
          <ImageIcon className="h-5 w-5 text-gray-400" />
          <span className="text-[10px] text-gray-600 font-medium">
            Imágenes
          </span>
        </button>
        <button className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-colors">
          <FolderOpen className="h-5 w-5 text-gray-400" />
          <span className="text-[10px] text-gray-600 font-medium">
            Proyectos
          </span>
        </button>
      </div>

      {/* Brand assets */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Activos de marca
        </p>
        <div className="p-4 rounded-lg bg-gray-50 border border-gray-100 text-center">
          <p className="text-[11px] text-gray-400">
            Sube logos y activos de tu marca para acceso rápido
          </p>
        </div>
      </div>
    </div>
  );
}
