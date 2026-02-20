"use client";

import React from "react";
import { ChevronLeft } from "lucide-react";
import type { SidebarPanelId } from "./types";

interface SidebarPanelProps {
  activePanel: SidebarPanelId | null;
  onClose: () => void;
  children: React.ReactNode;
}

const PANEL_TITLES: Record<SidebarPanelId, string> = {
  generate: "Generar con IA",
  templates: "Plantillas",
  elements: "Elementos",
  text: "Texto",
  media: "Archivos",
  layers: "Capas",
};

export function SidebarPanel({
  activePanel,
  onClose,
  children,
}: SidebarPanelProps) {
  if (!activePanel) return null;

  return (
    <div className="editor-sidebar-panel">
      {/* Panel header */}
      <div className="editor-sidebar-header">
        <h3 className="text-sm font-semibold text-gray-800">
          {PANEL_TITLES[activePanel]}
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          title="Cerrar panel"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Panel content — scrollable */}
      <div className="editor-sidebar-content">{children}</div>
    </div>
  );
}
