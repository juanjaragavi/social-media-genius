/**
 * DriveFolderPicker — Modal that lets the user choose where to save
 * banners in Google Drive.
 *
 * Two options:
 *   1. Default folder ("Social Media Genius Banners") — auto-resolved
 *   2. Custom folder — opens Google Picker to browse Drive
 */

"use client";

import React, { useCallback, useState } from "react";
import { FolderOpen, FolderPlus, X, Loader2 } from "lucide-react";
import { useGooglePicker } from "@/lib/hooks/use-google-picker";

interface DriveFolderPickerProps {
  /** User's Google OAuth access token */
  accessToken: string | null;
  /** Called when user confirms a destination (null = default folder) */
  onConfirm: (targetFolderId: string | null) => void;
  /** Called when user closes the modal without selecting */
  onCancel: () => void;
  /** Whether the upload is in progress */
  isUploading?: boolean;
}

export function DriveFolderPicker({
  accessToken,
  onConfirm,
  onCancel,
  isUploading = false,
}: DriveFolderPickerProps) {
  const [selectedFolder, setSelectedFolder] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleFolderSelected = useCallback(
    (folderId: string, folderName: string) => {
      setSelectedFolder({ id: folderId, name: folderName });
    },
    [],
  );

  const { openPicker } = useGooglePicker({
    accessToken,
    onFolderSelected: handleFolderSelected,
  });

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-semibold text-gray-800">
              Guardar en Google Drive
            </h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3">
          <p className="text-xs text-gray-500 mb-3">
            Elige dónde guardar tu banner:
          </p>

          {/* Option 1: Default folder */}
          <button
            onClick={() => {
              setSelectedFolder(null);
              onConfirm(null);
            }}
            disabled={isUploading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all text-left disabled:opacity-50 cursor-pointer group"
          >
            <div className="shrink-0 p-2 rounded-lg bg-blue-100 group-hover:bg-blue-200 transition-colors">
              <FolderOpen className="h-4 w-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-gray-800">
                Carpeta predeterminada
              </div>
              <div className="text-xs text-gray-500 truncate">
                Social Media Genius Banners
              </div>
            </div>
            {isUploading && !selectedFolder && (
              <Loader2 className="h-4 w-4 animate-spin text-blue-500 ml-auto" />
            )}
          </button>

          {/* Option 2: Custom folder via Picker */}
          {selectedFolder ? (
            <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-green-200 bg-green-50/50">
              <div className="shrink-0 p-2 rounded-lg bg-green-100">
                <FolderOpen className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-800">
                  Carpeta seleccionada
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {selectedFolder.name}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={openPicker}
                  disabled={isUploading}
                  className="text-xs px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Cambiar
                </button>
                <button
                  onClick={() => onConfirm(selectedFolder.id)}
                  disabled={isUploading}
                  className="text-xs px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                >
                  {isUploading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  Guardar aquí
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={openPicker}
              disabled={isUploading || !accessToken}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-dashed border-gray-300 hover:border-blue-300 hover:bg-gray-50 transition-all text-left disabled:opacity-50 cursor-pointer group"
            >
              <div className="shrink-0 p-2 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors">
                <FolderPlus className="h-4 w-4 text-gray-500" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-700">
                  Elegir otra carpeta
                </div>
                <div className="text-xs text-gray-400">
                  Buscar en tu Google Drive
                </div>
              </div>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onCancel}
            disabled={isUploading}
            className="text-xs px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
