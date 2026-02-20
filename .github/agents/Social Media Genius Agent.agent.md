---
name: Social Media Genius Agent
description: This custom agent assists with generating platform-optimized social media content using Google Gemini 2.5 Flash and Imagen 4.0. It is used for tasks related to content creation, scheduling, and platform API integrations.
argument-hint: Provide a specific task or question related to social media content generation, scheduling, or platform API integrations. For example, "Generate a Twitter post about our new product launch" or "How do I integrate with the Instagram API for posting images?"
model: Claude Opus 4.6 (copilot)
# tools: ['vscode', 'execute', 'read', 'agent', 'edit', 'search', 'web', 'todo'] # specify the tools this agent can use. If not set, all enabled tools are allowed.
---

# AI Agent Instructions - Social Media Genius

## Project Overview

A Next.js 16 application that generates platform-optimized social media content using Google Gemini 2.5 Flash and Imagen 4.0. The app creates posts with text, hashtags, and optional AI-generated images for Instagram, Twitter/X, Facebook, TikTok, and LinkedIn.

## Architecture

### Service Layer Pattern

All external API integrations follow a service class pattern:

- **`lib/google-client.ts`**: Centralized Google Cloud authentication with service account credentials fallback to ADC
- **`lib/services/imagen-service.ts`**: Image generation via Imagen 4.0 (migrated from EmailGenius)
- **`lib/services/veo-service.ts`**: Video generation via Veo 3.1
- Database operations in **`lib/database/service.ts`** (PostgreSQL with uuid-ossp extension)

### Platform Specifications System

**Critical**: All platform constraints are centralized in `lib/social-platform-specs.ts` (2026 specs):

- Instagram: 2200 chars, 5 hashtags max (down from 30 in 2025)
- Twitter: 280 chars standard (25K for Premium)
- Character limits, media formats, aspect ratios, hashtag limits

**Always** use `getPlatformSpec(platform)` to get constraints - never hardcode limits.

### API Routes Architecture

API routes in `app/api/*/route.ts` follow this pattern:

1. Validate request with platform specs
2. Build platform-specific system prompt with `getSystemPrompt(platform)` (see extensive prompts in `generate-post/route.ts`)
3. Call Gemini with structured JSON output format
4. Parse & validate response against platform limits
5. Log tokens/cost with emoji-based console logging (🤖 ✅ ⚠️ ❌)

## Branching Strategy & Environments

This project follows a strict three-tier branch architecture to ensure code quality and deployment safety:

- **`dev` (Development)**: The primary branch for all active development. All feature branches, bug fixes, and experimental code must be merged here first. This environment is used for initial testing and integration.
- **`staging` (Pre-production)**: The release candidate branch. Code is merged from `dev` to `staging` for final QA, user acceptance testing (UAT), and performance validation in an environment that mirrors production.
- **`main` (Production)**: The stable, production-ready branch. Only thoroughly tested code from `staging` is merged here. Direct commits or pushes to `main` are strictly prohibited.

**Workflow:** `Feature Branch` → `dev` → `staging` → `main`

## Git Workflow

When a user requests to push, commit, sync, or publish local changes to the repository, execute the following command:

```bash
bash scripts/git-workflow.sh "<commit message>"
```

Do not run raw `git add`, `git commit`, or `git push` commands directly. All repository operations must go through `scripts/git-workflow.sh`. The script enforces branch protection, pre-push validation (TypeScript type-check, ESLint, Prettier), rebase conflict detection, and conventional commit format. Bypassing it risks pushing type errors, lint failures, or conflicting history to the remote.

Available flags:

- `--branch <name>` — target a specific branch
- `--force` — enable force-push on non-protected branches (uses `--force-with-lease`)
- `--verify-build` — run `next build` before pushing
- `--skip-format` — skip Prettier formatting check
- `--dry-run` — execute all steps except the final push
- `--help` — print usage information

## Development Workflows

### Environment Setup

Required env vars:

```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### Running the App

```bash
npm run dev  # Starts on http://localhost:3050 (port changed from 3000 to avoid conflicts)
npm run build
npm run start  # Production starts on port 3050
```

**Port Configuration**: Application runs on port **3050** (not 3000) to avoid conflicts with other TopNetworks applications.

### TopNetworks Product Standards

This application follows **TopNetworks branding standards** established in the EmailGenius project:

**Visual Identity:**

- Favicon and brand assets from EmailGenius (`public/favicon.ico`, `public/favicon.png`)
- Color scheme: Blue (#2563eb), Green (#84cc16), Cyan (#06b6d4) palette
- Tailwind configuration in `tailwind.config.js` with TopNetworks brand colors
- CSS variables system in `app/globals.css` for consistent theming

**Localization:**

- **UI Language**: Spanish (not English)
- All user-facing text must be in Spanish
- Components localized: `page.tsx`, `post-generator.tsx`, `post-result.tsx`
- Maintain consistent Spanish terminology across the application

**Brand Alignment:**

- Header gradient: `from-blue-600 to-cyan-600` (TopNetworks colors, not purple/pink)
- Follows EmailGenius design system and UI patterns
- Consistent with other TopNetworks products in the ecosystem

### Testing APIs

Use `scripts/test-api.ts` for testing API routes (not test-setup.ts which is for database setup).

## Project-Specific Conventions

### Type System

- Platform types in `types/social-platforms.ts`: `Platform`, `PostType`, `Tone`, `ContentLength`, `ImageStyle`, `VideoStyle`
- API contracts: `GeneratePostRequest`, `GeneratePostResponse` with strict metadata structure
- Database types in `types/generated-post.ts`: `GeneratedPostData` includes both post content and generation metadata

### Validation Pattern

Always validate generated content:

```typescript
import { validateTextContent, validateHashtags } from "@/lib/social-validators";
const validation = validateTextContent(platform, content);
// Returns: { valid, errors, warnings, stats }
```

### Component Architecture

**Canva-Style Visual Editor (Primary UI):**

- **`EditorLayout`** — Top-level composition wrapping `CanvasProvider` context
- **`TopToolbar`** — Header bar with logo, undo/redo, dimension badges, export button, user session
- **`IconRail`** — Left vertical sidebar with 6 panel toggles (Generar, Plantillas, Elementos, Texto, Archivos, Capas)
- **`SidebarPanel`** — 320px animated panel container
- **`InteractiveCanvas`** — Konva `<Stage>` with drag, resize, transform, zoom, keyboard shortcuts
- **`InlinePropertiesPanel`** — Right-side context-sensitive element property editor (280px)
- **`PropertiesPanel`** — Right-side AI generation results display

**Connected Panel Pattern:**

- `ConnectedElementsPanel`, `ConnectedTextPanel`, `ConnectedMediaPanel`, `ConnectedLayersPanel`
- `GeneratePanel` — AI content generation form
- `TemplatesPanel` — dimension/aspect-ratio picker

**State Management:**

- **`CanvasProvider` / `useCanvasContext()`** — React Context for all editor state
- Factory functions: `createTextElement`, `createImageElement`, `createShapeElement`
- Element types: text, image, shape (rect/circle/triangle/star/line), watermark, sticker
- Client components use `'use client'` directive

**Legacy Components (still present):**

- `PostGenerator`, `PostResult` — Original standalone card UI
- `BannerEditor` — Monolithic Konva editor (predecessor)

### UI Component Pattern

All UI components in `components/ui/` from shadcn/ui:

- Import from `@/components/ui/button`, `@/components/ui/card`, etc.
- Use `className` with tailwind-merge via `cn()` utility from `lib/utils.ts`

### Cost Tracking

Every API call logs cost with this formula (see `generate-post/route.ts` lines 220-226):

```typescript
const costPerInputToken = 0.075 / 1_000_000; // Gemini 2.5 Flash
const costPerOutputToken = 0.3 / 1_000_000;
const cost =
  inputTokens * costPerInputToken + outputTokens * costPerOutputToken;
```

## Critical Integration Points

### Google Cloud Vertex AI

- Uses `@google/genai` SDK (v1.38.0+) with vertexai mode
- Authentication: Service account credentials with `private_key.replace(/\\n/g, '\n')` transformation
- Model names: `gemini-2.5-flash`, `imagen-4.0-ultra-generate-001`, `veo-3.1-fast-generate-preview`

### Database (PostgreSQL)

Schema in `lib/database/schema.sql`:

- UUID primary keys with `uuid_generate_v4()`
- JSONB for flexible metadata storage
- TEXT[] arrays for hashtags
- Foreign key cascade deletes for images/videos

### Image Generation Flow

1. Text generation in `/api/generate-post` creates `imagePrompt`
2. Client calls `/api/generate-image` with prompt + platform
3. `ImagenService` uses platform aspect ratio from specs (1:1 for Instagram, 16:9 for Twitter, etc.)
4. Returns base64 data URL or stores in database

## Data Flow

```
EditorLayout (CanvasProvider)
  → GeneratePanel form
  → POST /api/generate-post
  → getSystemPrompt(platform) + user prompt
  → Gemini 2.5 Flash → JSON parse & validate
  → Banner image rendered on InteractiveCanvas (Konva)
  → PropertiesPanel displays generation results
  → (optional) POST /api/generate-image → ImagenService
  → Export via Konva Stage.toDataURL()
```

## Testing Patterns

- No formal test suite yet (add tests in `__tests__/` following Next.js conventions)
- Manual testing via UI or `scripts/test-api.ts`
- Validation functions have inline examples in JSDoc comments

## Common Gotchas

1. **Instagram hashtag limit**: Changed to 5 in 2026 (was 30). Code is updated; don't revert.
2. **Private key formatting**: Always use `.replace(/\\n/g, '\n')` when reading from env vars
3. **JSON parsing from Gemini**: Use regex `text.match(/\{[\s\S]*\}/)` to extract JSON from markdown-wrapped responses
4. **Platform validation**: Always validate after generation - Gemini can hallucinate invalid content
5. **Aspect ratios**: Use platform specs, not hardcoded values (Instagram prefers 4:5 portrait, not always 1:1)

## File Organization

```bash
├── app/
│   ├── api/
│   │   ├── generate-post/    # Text + hashtag + banner generation
│   │   ├── generate-image/   # Imagen 4.0 image generation
│   │   ├── generate-video/   # Veo 3.1 video generation
│   │   ├── ai-edit/          # AI-powered canvas editing
│   │   ├── validate-content/ # Platform constraint validation
│   │   ├── upload/           # GCS file upload
│   │   └── auth/[...all]/    # Better Auth handler
│   ├── login/                # Login page (Google OAuth)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── editor/               # Canva-style visual editor (primary UI)
│   │   ├── editor-layout.tsx
│   │   ├── canvas-context.tsx
│   │   ├── interactive-canvas.tsx
│   │   ├── top-toolbar.tsx
│   │   ├── icon-rail.tsx
│   │   ├── sidebar-panel.tsx
│   │   ├── inline-properties-panel.tsx
│   │   ├── properties-panel.tsx
│   │   └── panels/           # Connected + presentational panels
│   ├── banner-editor/        # Legacy monolithic banner editor
│   ├── post-generator.tsx    # Legacy standalone form
│   ├── post-result.tsx       # Legacy standalone results
│   └── ui/                   # shadcn/ui + platform icons
├── lib/
│   ├── services/
│   │   ├── imagen-service.ts
│   │   ├── veo-service.ts
│   │   ├── google-drive-service.ts
│   │   └── supabase-service.ts
│   ├── database/             # Schema + service
│   ├── firebase/             # Firebase integration
│   ├── gcp/                  # GCP utilities
│   ├── i18n/                 # Internationalization (EN, ES, BR)
│   ├── storage/              # Storage utilities
│   ├── auth.ts               # Better Auth server config
│   ├── auth-client.ts        # Better Auth client config
│   ├── auth-session.ts       # Server session helper
│   ├── google-client.ts      # Google Cloud auth
│   ├── rate-limit.ts         # Supabase rate limiter
│   ├── social-platform-specs.ts  # Platform constraints (source of truth)
│   ├── social-validators.ts      # Content validation
│   └── utils.ts              # cn() and shared utils
├── types/
│   ├── social-platforms.ts   # Platform enums and API contracts
│   ├── generated-post.ts     # Database types
│   └── editor.ts             # Editor types + BANNER_DIMENSIONS
├── scripts/
│   ├── git-workflow.sh       # Automated git workflow (required for all pushes)
│   ├── 001-auth-and-rate-limiting.sql  # DB setup script
│   ├── test-api.ts           # Manual API testing
│   ├── test-setup.ts         # Database initialization
│   └── vercel-env-manage.sh  # Vercel env management
└── public/
    └── images/               # Static assets
```
