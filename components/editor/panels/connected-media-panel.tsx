"use client";

import React, { useState, useCallback, useRef } from "react";
import {
  Upload,
  ImageIcon,
  FolderOpen,
  X,
  Check,
  AlertCircle,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { useCanvasContext } from "../canvas-context";
import type { UploadedFile } from "../canvas-context";

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

/**
 * ConnectedMediaPanel wires the file upload / drag-drop zone
 * to the shared canvas context, so uploaded images appear on the canvas.
 */
export function ConnectedMediaPanel() {
  const { addImage, uploadedFiles, addUploadedFile } = useCanvasContext();
  const [dragOver, setDragOver] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setUploadError(
          `Formato no soportado: ${file.type}. Usa PNG, JPG, GIF, WebP o SVG.`,
        );
        return;
      }
      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setUploadError(`El archivo es demasiado grande (máx. 20 MB).`);
        return;
      }

      setUploadError(null);
      setIsUploading(true);

      try {
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error("Error leyendo archivo"));
          reader.readAsDataURL(file);
        });

        const uploadedFile: UploadedFile = {
          id: uuidv4(),
          name: file.name,
          type: file.type,
          dataUrl,
          size: file.size,
        };

        addUploadedFile(uploadedFile);
        addImage(dataUrl, file.name);
      } catch {
        setUploadError("Error al procesar el archivo. Intenta de nuevo.");
      } finally {
        setIsUploading(false);
      }
    },
    [addImage, addUploadedFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files);
      files.forEach((file) => processFile(file));
    },
    [processFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => processFile(file));
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [processFile],
  );

  const handleThumbnailClick = useCallback(
    (file: UploadedFile) => {
      addImage(file.dataUrl, file.name);
    },
    [addImage],
  );

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
        className={`editor-upload-zone ${dragOver ? "active" : ""} ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <div className="editor-canvas-spinner mx-auto mb-2" />
            <p className="text-xs font-medium text-gray-500">Subiendo...</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-xs font-medium text-gray-500 mb-1">
              Arrastra archivos aquí
            </p>
            <p className="text-[10px] text-gray-400">o haz clic para buscar</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          multiple
          onChange={handleFileInput}
        />
      </div>

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-red-700">{uploadError}</p>
          </div>
          <button
            onClick={() => setUploadError(null)}
            className="p-0.5 rounded hover:bg-red-100 text-red-400"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center gap-1.5 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 hover:border-gray-200 transition-colors"
        >
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

      {/* Uploaded files gallery */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Archivos subidos ({uploadedFiles.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {uploadedFiles.map((file) => (
              <button
                key={file.id}
                onClick={() => handleThumbnailClick(file)}
                className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-blue-400 transition-colors bg-gray-50"
                title={`${file.name} — clic para añadir al canvas`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.dataUrl}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition-colors">
                  <Check className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand assets placeholder */}
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
