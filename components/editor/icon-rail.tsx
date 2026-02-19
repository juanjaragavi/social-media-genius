"use client";

import React from "react";
import {
  Sparkles,
  LayoutGrid,
  Shapes,
  Type,
  Upload,
  Layers,
} from "lucide-react";
import type { SidebarPanelId } from "./types";

interface IconRailProps {
  activePanel: SidebarPanelId | null;
  onSelectPanel: (panel: SidebarPanelId) => void;
}

const RAIL_ITEMS: {
  id: SidebarPanelId;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}[] = [
  { id: "generate", icon: Sparkles, label: "Generar" },
  { id: "templates", icon: LayoutGrid, label: "Plantillas" },
  { id: "elements", icon: Shapes, label: "Elementos" },
  { id: "text", icon: Type, label: "Texto" },
  { id: "media", icon: Upload, label: "Archivos" },
  { id: "layers", icon: Layers, label: "Capas" },
];

export function IconRail({ activePanel, onSelectPanel }: IconRailProps) {
  return (
    <nav className="editor-icon-rail">
      {RAIL_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activePanel === item.id;

        return (
          <button
            key={item.id}
            onClick={() => onSelectPanel(item.id)}
            className={`editor-rail-item ${isActive ? "active" : ""}`}
            title={item.label}
          >
            <Icon className="h-5 w-5" />
            <span className="editor-rail-label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
