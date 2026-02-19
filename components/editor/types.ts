/**
 * Type definitions for the Canva-style editor layout
 */

export type SidebarPanelId =
  | "generate"
  | "templates"
  | "elements"
  | "text"
  | "media"
  | "layers";

export interface SidebarItem {
  id: SidebarPanelId;
  label: string;
  iconName: string;
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
  { id: "generate", label: "Generar", iconName: "sparkles" },
  { id: "templates", label: "Plantillas", iconName: "layout" },
  { id: "elements", label: "Elementos", iconName: "shapes" },
  { id: "text", label: "Texto", iconName: "type" },
  { id: "media", label: "Archivos", iconName: "upload" },
  { id: "layers", label: "Capas", iconName: "layers" },
];
