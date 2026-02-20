# UI/UX Changelog — Social Media Genius

> Comprehensive record of UI/UX evolution, derived from a live codebase audit.
> **Last updated:** February 2026

---

## Table of Contents

- [Current Architecture: Canva-Style Visual Editor](#current-architecture-canva-style-visual-editor)
- [Component Inventory](#component-inventory)
- [Layout System](#layout-system)
- [Design System & Brand Colors](#design-system--brand-colors)
- [State Management](#state-management)
- [Element Types](#element-types)
- [Canvas Dimensions & Presets](#canvas-dimensions--presets)
- [Sidebar Panels](#sidebar-panels)
- [Authentication UI](#authentication-ui)
- [Legacy Components](#legacy-components)
- [Dependencies](#dependencies)
- [Known Considerations](#known-considerations)

---

## Current Architecture: Canva-Style Visual Editor

The primary UI is a **full-screen, viewport-locked visual editor** inspired by Canva. It replaced the original standalone `PostGenerator` → `PostResult` card-based flow.

**Entry point:** `app/page.tsx` renders `<EditorLayout />` directly — no intermediate routing.

### Top-Level Composition

```text
EditorLayout (wraps CanvasProvider)
  ├── TopToolbar           — Header: logo, undo/redo, dimensions, export, user session
  ├── IconRail             — Left sidebar: 6 panel toggle icons (64px wide)
  ├── SidebarPanel         — Collapsible 320px animated panel
  ├── CanvasArea
  │   └── InteractiveCanvas — Konva <Stage> with full interaction model
  ├── InlinePropertiesPanel — Right-side element editor (280px, conditional)
  └── PropertiesPanel      — Right-side AI results display (conditional)
```

---

## Component Inventory

### Editor Core (`components/editor/`)

| Component                     | Lines | Purpose                                                       |
| ----------------------------- | ----- | ------------------------------------------------------------- |
| `editor-layout.tsx`           | ~250  | Top-level layout composition, wraps `CanvasProvider`          |
| `canvas-context.tsx`          | ~600  | React Context: all editor state, history, CRUD operations     |
| `interactive-canvas.tsx`      | ~500  | Konva `<Stage>` with transforms, zoom, keyboard shortcuts     |
| `top-toolbar.tsx`             | ~200  | Header bar: logo, undo/redo, dimension badge, export, session |
| `icon-rail.tsx`               | ~150  | Left icon sidebar with 6 panel toggles                        |
| `sidebar-panel.tsx`           | ~100  | Animated 320px slide-out container                            |
| `canvas-area.tsx`             | ~100  | Wrapper positioning the canvas within the layout              |
| `inline-properties-panel.tsx` | ~400  | Right-side context-sensitive property editor                  |
| `properties-panel.tsx`        | ~300  | Right-side AI generation results display                      |
| `types.ts`                    | ~50   | Editor-local type re-exports                                  |

### Connected Panels (`components/editor/panels/`)

| Component                      | Purpose                                                   |
| ------------------------------ | --------------------------------------------------------- |
| `generate-panel.tsx`           | AI content generation form (platform, tone, type, prompt) |
| `templates-panel.tsx`          | Dimension/aspect-ratio picker, organized by orientation   |
| `connected-elements-panel.tsx` | Adds shapes/stickers to canvas via `CanvasContext`        |
| `connected-text-panel.tsx`     | Inserts text presets (title/subtitle/body) onto canvas    |
| `connected-media-panel.tsx`    | File upload (max 20MB), validation, image placement       |
| `connected-layers-panel.tsx`   | Layer ordering, visibility toggle, lock management        |
| `elements-panel.tsx`           | Presentational: shape/sticker catalog                     |
| `text-panel.tsx`               | Presentational: text preset catalog                       |
| `media-panel.tsx`              | Presentational: upload UI                                 |
| `layers-panel.tsx`             | Presentational: layer list with drag handle UI            |

### Shared UI (`components/ui/`)

| Component            | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `button.tsx`         | shadcn/ui Button with variants            |
| `card.tsx`           | shadcn/ui Card                            |
| `input.tsx`          | shadcn/ui Input                           |
| `label.tsx`          | shadcn/ui Label                           |
| `textarea.tsx`       | shadcn/ui Textarea                        |
| `header.tsx`         | Reusable header (used in login page)      |
| `platform-icons.tsx` | Custom SVG icons for each social platform |

---

## Layout System

### Viewport-Locked Editor

The editor occupies the full viewport (`100vh × 100vw`) with no scrolling:

- **TopToolbar:** Fixed at top, ~56px height
- **IconRail:** Fixed left column, 64px width
- **SidebarPanel:** 320px, animates in from left (pushes content)
- **CanvasArea:** Fills remaining space, centers the canvas
- **InlinePropertiesPanel:** 280px right column (shown when element selected)
- **PropertiesPanel:** Right column (shown after AI generation)

### CSS Architecture

- **Tailwind CSS v4** with `@import "tailwindcss"` syntax
- **`@theme inline`** block in `globals.css` for CSS custom properties
- **Font:** Poppins (Google Fonts), weights 300–700, CSS variable `--font-poppins`
- **Editor-specific classes:** `editor-layout`, `editor-canvas`, `editor-panel-*`
- **Color tokens:** HSL-based via CSS variables (`--background`, `--foreground`, `--primary`, etc.)

### TopNetworks Brand Colors

| Token        | Value     | Usage                     |
| ------------ | --------- | ------------------------- |
| Primary Blue | `#2563eb` | Buttons, links, accents   |
| Cyan         | `#06b6d4` | Gradient end, highlights  |
| Lime/Green   | `#84cc16` | Success states, secondary |

**Header gradient:** `from-blue-600 to-cyan-600` (never purple/pink).

---

## State Management

### CanvasProvider / useCanvasContext()

All editor state lives in a single React Context (`canvas-context.tsx`):

**State shape:**

- `elements: AnyEditorElement[]` — ordered array of canvas elements
- `selectedElementId: string | null` — currently selected element
- `canvasWidth / canvasHeight` — active canvas dimensions
- `backgroundColor: string` — canvas background color
- `zoom: number` — current zoom level
- `history: EditorHistoryEntry[]` — undo/redo stack
- `historyIndex: number` — current position in history
- `uploadedFiles: File[]` — files staged for use

**Operations exposed:**

- `addElement()`, `updateElement()`, `deleteElement()`
- `selectElement()`, `deselectAll()`
- `reorderElement()` — z-index management
- `undo()`, `redo()` — history navigation
- `setCanvasSize()`, `setBackgroundColor()`, `setZoom()`

**Factory functions:**

- `createTextElement(overrides?)` — text with defaults (Poppins, 24px, black)
- `createImageElement(src, overrides?)` — image from URL/data URI
- `createShapeElement(shapeType, overrides?)` — rect/circle/triangle/star/line

---

## Element Types

Defined in `types/editor.ts`:

| Type        | Interface          | Properties                                                                                |
| ----------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `text`      | `TextElement`      | text, fontSize, fontFamily, fontWeight, fontStyle, fill, align, lineHeight, letterSpacing |
| `image`     | `ImageElement`     | src, cropX/Y/Width/Height, filters[]                                                      |
| `shape`     | `ShapeElement`     | shapeType (rect/circle/triangle/star/line), fill, stroke, strokeWidth, cornerRadius       |
| `watermark` | `WatermarkElement` | src, position (7 positions), padding, scale                                               |
| `sticker`   | (via ImageElement) | Pre-defined decorative images                                                             |

**Common base properties** (all elements): `id`, `type`, `x`, `y`, `width`, `height`, `rotation`, `opacity`, `visible`, `locked`, `name`, `zIndex`.

**Image filters:** brightness, contrast, saturation, blur, grayscale, sepia.

---

## Canvas Dimensions & Presets

9 presets defined in `BANNER_DIMENSIONS` (`types/editor.ts`):

| Label             | Size      | Ratio  | Platform  |
| ----------------- | --------- | ------ | --------- |
| 1:1 — 1080×1080   | 1080×1080 | 1:1    | —         |
| 1:1 — 1200×1200   | 1200×1200 | 1:1    | —         |
| 4:5 — 1080×1350   | 1080×1350 | 4:5    | Instagram |
| 3:4 — 1080×1440   | 1080×1440 | 3:4    | —         |
| 9:16 — 1080×1920  | 1080×1920 | 9:16   | TikTok    |
| 16:9 — 1200×675   | 1200×675  | 16:9   | Twitter   |
| 16:9 — 1920×1080  | 1920×1080 | 16:9   | —         |
| 1.91:1 — 1200×628 | 1200×628  | 1.91:1 | Facebook  |
| 1.91:1 — 1200×627 | 1200×627  | 1.91:1 | LinkedIn  |

**Campaign mode** (`CampaignDimensions`): Supports generating a primary + secondary + tertiary banner set in a single operation.

---

## Sidebar Panels

The `IconRail` exposes 6 panel toggles (labels in Spanish):

| Icon | Panel       | Spanish Label | Component                |
| ---- | ----------- | ------------- | ------------------------ |
| ✨   | Generate    | Generar       | `GeneratePanel`          |
| 📐   | Templates   | Plantillas    | `TemplatesPanel`         |
| 🔷   | Elements    | Elementos     | `ConnectedElementsPanel` |
| 🔤   | Text        | Texto         | `ConnectedTextPanel`     |
| 📁   | Media/Files | Archivos      | `ConnectedMediaPanel`    |
| 📚   | Layers      | Capas         | `ConnectedLayersPanel`   |

Each "Connected" panel wraps a presentational panel and bridges it to `CanvasContext` for state mutations.

---

## Authentication UI

### Login Page (`app/login/page.tsx`)

- **Provider:** Google OAuth only (email/password disabled)
- **Domain restriction:** `@topnetworks.co` and `@topfinanzas.com` only
- **Flow:** Single "Iniciar sesión con Google" button → Better Auth → redirect to editor
- **Session:** 7-day expiry, refreshed daily, 5-minute cookie cache

---

## Legacy Components

These components remain in the codebase but are **not the primary UI**:

| Component       | File                            | Status                                           |
| --------------- | ------------------------------- | ------------------------------------------------ |
| `PostGenerator` | `components/post-generator.tsx` | Original standalone form                         |
| `PostResult`    | `components/post-result.tsx`    | Original results card                            |
| `BannerEditor`  | `components/banner-editor/`     | Monolithic ~1300-line Konva editor (predecessor) |

These are retained for reference and potential reuse but `app/page.tsx` no longer renders them.

---

## Dependencies

### Canvas & Visual Editor

| Package          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `react-konva`    | React bindings for Konva canvas library   |
| `konva`          | 2D canvas framework (shapes, transforms)  |
| `use-image`      | React hook for loading images into Konva  |
| `react-colorful` | Lightweight color picker (HexColorPicker) |
| `uuid`           | Element ID generation                     |

### AI & Backend

| Package         | Purpose                             |
| --------------- | ----------------------------------- |
| `@google/genai` | Vertex AI SDK (Gemini, Imagen, Veo) |
| `better-auth`   | Authentication framework            |
| `pg`            | PostgreSQL client                   |

### UI Framework

| Package                    | Purpose                  |
| -------------------------- | ------------------------ |
| `next` (v16.1.6)           | React framework          |
| `react` (v19.2.3)          | UI library               |
| `tailwindcss` (v4)         | Utility-first CSS        |
| `class-variance-authority` | Component variant system |
| `clsx` + `tailwind-merge`  | Class name utilities     |
| `lucide-react`             | Icon library             |

---

## Known Considerations

1. **InteractiveCanvas performance**: The canvas re-renders on every element change. For canvases with 50+ elements, consider implementing `React.memo` boundaries or Konva layer separation.
2. **No formal test suite**: The editor components have no automated tests. Manual testing is done via the UI.
3. **Legacy cleanup**: `PostGenerator`, `PostResult`, and `BannerEditor` can be removed once the editor is fully validated in production.
4. **Mobile responsiveness**: The editor layout is optimized for desktop (1280px+ viewport). Mobile/tablet support is limited.
5. **Export quality**: `Stage.toDataURL()` exports at current canvas resolution. High-DPI export may need `pixelRatio` configuration.
6. **Watermark element**: Defined in types but not yet fully implemented in the Connected Panels.
7. **i18n output locales**: The AI generates content in 3 locales (EN, ES, BR) via `lib/i18n/translations.ts`, but the **UI itself is always Spanish**.

---

**Organization:** TopNetworks, Inc.
