/**
 * Type definitions for the Canva-style visual editor
 */

export type EditorElementType =
  | "text"
  | "image"
  | "shape"
  | "watermark"
  | "sticker";

export interface EditorElement {
  id: string;
  type: EditorElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  name: string;
  zIndex: number;
}

export interface TextElement extends EditorElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through";
  fill: string;
  align: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageElement extends EditorElement {
  type: "image";
  src: string;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  filters?: ImageFilter[];
}

export interface ShapeElement extends EditorElement {
  type: "shape";
  shapeType: "rect" | "circle" | "triangle" | "star" | "line";
  fill: string;
  stroke: string;
  strokeWidth: number;
  cornerRadius?: number;
}

export interface WatermarkElement extends EditorElement {
  type: "watermark";
  src: string;
  position: WatermarkPosition;
  padding: number;
  scale: number;
}

export type WatermarkPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ImageFilter {
  type:
    | "brightness"
    | "contrast"
    | "saturation"
    | "blur"
    | "grayscale"
    | "sepia";
  value: number;
}

export type AnyEditorElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | WatermarkElement;

export interface EditorState {
  elements: AnyEditorElement[];
  selectedElementId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  zoom: number;
  history: EditorHistoryEntry[];
  historyIndex: number;
}

export interface EditorHistoryEntry {
  elements: AnyEditorElement[];
  timestamp: number;
}

export interface EditorAction {
  type:
    | "add"
    | "update"
    | "delete"
    | "reorder"
    | "select"
    | "deselect"
    | "undo"
    | "redo";
  element?: AnyEditorElement;
  elementId?: string;
  updates?: Partial<AnyEditorElement>;
  newIndex?: number;
}

export interface BannerDimension {
  label: string;
  width: number;
  height: number;
  aspectRatio: string;
  platform?: string;
}

export const BANNER_DIMENSIONS: BannerDimension[] = [
  // Square formats
  { label: "1:1 — 1080×1080", width: 1080, height: 1080, aspectRatio: "1:1" },
  { label: "1:1 — 1200×1200", width: 1200, height: 1200, aspectRatio: "1:1" },

  // Portrait formats
  {
    label: "4:5 — 1080×1350",
    width: 1080,
    height: 1350,
    aspectRatio: "4:5",
    platform: "instagram",
  },
  { label: "3:4 — 1080×1440", width: 1080, height: 1440, aspectRatio: "3:4" },
  {
    label: "9:16 — 1080×1920",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
    platform: "tiktok",
  },

  // Landscape formats
  {
    label: "16:9 — 1200×675",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    platform: "twitter",
  },
  { label: "16:9 — 1920×1080", width: 1920, height: 1080, aspectRatio: "16:9" },
  {
    label: "1.91:1 — 1200×628",
    width: 1200,
    height: 628,
    aspectRatio: "1.91:1",
    platform: "facebook",
  },

  // LinkedIn
  {
    label: "1.91:1 — 1200×627",
    width: 1200,
    height: 627,
    aspectRatio: "1.91:1",
    platform: "linkedin",
  },
];

export interface CampaignDimensions {
  primary: BannerDimension;
  secondary: BannerDimension;
  tertiary: BannerDimension;
}
