# CLAUDE.md — Social Media Genius

## Project Overview

**Social Media Genius** is an AI-powered social media content generation platform by TopNetworks, Inc. It creates platform-optimized posts (text + hashtags + optional AI images/videos) for Instagram, Twitter/X, Facebook, TikTok, and LinkedIn using Google Gemini 2.5 Flash and Imagen 4.0 Ultra.

- **Port:** 3050 (never 3000 — reserved for other TopNetworks apps)
- **Production Domain:** social.topnetworks.co
- **Staging:** social-media-genius.vercel.app
- **UI Language:** Spanish (all user-facing text must be in Spanish)

---

## Essential Commands

```bash
npm run dev      # Development server → http://localhost:3050
npm run build    # Production build
npm run start    # Production server on port 3050
npm run lint     # ESLint
npm run format   # Prettier
```

---

## Branching Strategy & Environments

This project follows a strict three-tier branch architecture to ensure code quality and deployment safety:

- **`dev` (Development)**: The primary branch for all active development. All feature branches, bug fixes, and experimental code must be merged here first. This environment is used for initial testing and integration.
- **`staging` (Pre-production)**: The release candidate branch. Code is merged from `dev` to `staging` for final QA, user acceptance testing (UAT), and performance validation in an environment that mirrors production.
- **`main` (Production)**: The stable, production-ready branch. Only thoroughly tested code from `staging` is merged here. Direct commits or pushes to `main` are strictly prohibited.

**Workflow:** `Feature Branch` → `dev` → `staging` → `main`

---

## Architecture

### Service Layer Pattern

All external integrations live in `lib/` as centralized services:

| File                             | Purpose                                            |
| -------------------------------- | -------------------------------------------------- |
| `lib/google-client.ts`           | Google Cloud auth (service account → ADC fallback) |
| `lib/services/imagen-service.ts` | Imagen 4.0 Ultra image generation                  |
| `lib/services/veo-service.ts`    | Veo 3.1 video generation                           |
| `lib/database/service.ts`        | PostgreSQL operations                              |
| `lib/auth.ts`                    | Better Auth server config (Google OAuth only)      |
| `lib/auth-client.ts`             | Better Auth client config                          |
| `lib/auth-session.ts`            | Server-side session helper                         |
| `lib/rate-limit.ts`              | Supabase-backed sliding-window rate limiting       |

### API Routes (`app/api/*/route.ts`)

| Route                   | Purpose                              |
| ----------------------- | ------------------------------------ |
| `/api/generate-post`    | Text + hashtag generation via Gemini |
| `/api/generate-image`   | Image generation via Imagen          |
| `/api/generate-video`   | Video generation via Veo             |
| `/api/validate-content` | Platform constraint validation       |
| `/api/upload`           | File upload to GCS                   |
| `/api/auth/[...all]`    | Better Auth handler                  |

Every API route follows this flow:

1. Validate request with platform specs
2. Build platform-specific system prompt via `getSystemPrompt(platform)`
3. Call Gemini with structured JSON output
4. Parse response (use regex `text.match(/\{[\s\S]*\}/)` to strip markdown wrappers)
5. Validate against platform limits
6. Log tokens/cost with emoji logging (🤖 ✅ ⚠️ ❌)

### Data Flow

```bash
PostGenerator (client)
  → POST /api/generate-post
  → getSystemPrompt(platform) + user prompt
  → Gemini 2.5 Flash → JSON parse & validate
  → (optional) POST /api/generate-image → ImagenService
  → PostResult display
```

### Component State

- `PostGenerator` → `onPostGenerated` callback → `Home` state → `PostResult`
- No global state — props drilling only (appropriate for this app's scope)
- Client components use `'use client'` directive

---

## Platform Specifications System (CRITICAL)

All platform constraints are centralized in `lib/social-platform-specs.ts`. **NEVER hardcode platform limits.**

```typescript
// Always retrieve constraints this way:
import { getPlatformSpec } from "@/lib/social-platform-specs";
const spec = getPlatformSpec(platform); // returns PlatformSpec | null
```

**2026 Specs:**

| Platform  | Max Chars                     | Hashtag Limit            | Primary Aspect Ratio |
| --------- | ----------------------------- | ------------------------ | -------------------- |
| Instagram | 2,200                         | 5 (down from 30 in 2025) | 4:5 portrait         |
| Twitter/X | 280 (25K Premium)             | No strict limit          | 16:9                 |
| Facebook  | 63,206                        | No strict limit          | 1.91:1               |
| TikTok    | 4,000 (up from 2,200 in 2025) | 30                       | 9:16                 |
| LinkedIn  | 3,000                         | No strict limit          | 1.91:1               |

---

## Type System

**`types/social-platforms.ts`:**

- `Platform`: `'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'linkedin'`
- `PostType`: `'promotional' | 'educational' | 'entertaining' | 'news' | 'announcement' | 'behind-the-scenes' | 'user-generated' | 'poll' | 'question'`
- `Tone`: `'casual' | 'professional' | 'friendly' | 'urgent' | 'inspiring' | 'humorous' | 'empathetic' | 'authoritative'`
- `ContentLength`: `'short' | 'medium' | 'long'`

**`types/generated-post.ts`:** `GeneratedPostData` — database representation including content and generation metadata.

---

## Authentication

- **Provider:** Google OAuth only (email/password disabled)
- **Library:** Better Auth 1.x with `nextCookies()` plugin
- **Domain restriction:** Only `@topnetworks.co` and `@topfinanzas.com` emails
- **Database:** Supabase PostgreSQL (Better Auth manages its own tables)
- **Session:** 7-day expiry, refreshed daily, 5-minute cookie cache

**Auth URL resolution priority:**

1. `BETTER_AUTH_URL`
2. `https://${VERCEL_URL}` (auto-set by Vercel)
3. `NEXT_PUBLIC_APP_URL`
4. `http://localhost:3050` (fallback)

**Database URL priority (for auth):**

1. `SUPABASE_DB_URL` — Supabase pooler (required on Vercel)
2. `POSTGRES_URL`
3. `DATABASE_URL` — Cloud SQL (local only, unreachable from Vercel)

---

## Google Cloud Integration

- **SDK:** `@google/genai` v1.38.0+ in `vertexai` mode
- **Models:** `gemini-2.5-flash`, `imagen-4.0-ultra-generate-001`, `veo-3.1-fast-generate-preview`
- **Auth:** Service account with ADC fallback (see `lib/google-client.ts`)

**Private key formatting — always required:**

```typescript
private_key: process.env.GOOGLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
```

**Cost tracking formula (Gemini 2.5 Flash):**

```typescript
const costPerInputToken = 0.075 / 1_000_000;
const costPerOutputToken = 0.3 / 1_000_000;
const cost =
  inputTokens * costPerInputToken + outputTokens * costPerOutputToken;
```

---

## Database

### PostgreSQL (Cloud SQL — local development)

Schema at `lib/database/schema.sql`:

- UUID primary keys via `uuid_generate_v4()`
- JSONB for flexible metadata
- `TEXT[]` arrays for hashtags
- Foreign key cascade deletes for images/videos
- Analytics views: `recent_activity`, `platform_statistics`

### Supabase (production / Vercel)

- **Auth + rate limiting** use Supabase
- Rate limiting via `check_rate_limit()` PG function (see `scripts/001-auth-and-rate-limiting.sql`)
- Rate limiter fails open — never blocks traffic on DB errors

---

## Image Generation Flow

1. `/api/generate-post` returns an `imagePrompt` field in the response
2. Client calls `/api/generate-image` with `{ prompt, platform }`
3. `ImagenService` reads aspect ratio from `getPlatformSpec(platform)` (never hardcoded)
4. Returns base64 data URL or stores in GCS

---

## Validation Pattern

Always validate generated content after AI generation:

```typescript
import { validateTextContent, validateHashtags } from "@/lib/social-validators";
const validation = validateTextContent(platform, content);
// Returns: { valid, errors, warnings, stats }
```

Gemini can hallucinate content that exceeds platform limits — always validate.

---

## TopNetworks Brand Standards

### Colors

- Primary Blue: `#2563eb`
- Cyan: `#06b6d4`
- Lime/Green: `#84cc16`
- Header gradient: `from-blue-600 to-cyan-600` (never purple/pink)

### UI

- Shadcn/ui components from `components/ui/` — import from `@/components/ui/button`, etc.
- Use `cn()` utility from `lib/utils.ts` for class merging (Tailwind Merge)
- Tailwind CSS v4

### Localization

- All user-facing text **must be in Spanish**
- Localized components: `app/page.tsx`, `components/post-generator.tsx`, `components/post-result.tsx`

---

## Environment Variables

See `.env.example` for the full list. Key variables:

```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3050
PORT=3050

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT=
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=

# Supabase (required on Vercel)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_DB_URL=         # Supabase pooler URI — use this on Vercel, NOT DATABASE_URL

# Better Auth
BETTER_AUTH_SECRET=      # Generate: openssl rand -base64 32
BETTER_AUTH_URL=         # Set to production URL in Vercel env vars

# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# GCS
GCS_BUCKET_NAME=
GCS_PROJECT_ID=
GCS_CLIENT_EMAIL=

# Feature Flags
DISABLE_RATE_LIMITING=true       # Set true in development
NEXT_PUBLIC_ENABLE_LOGGING=true  # Set false in production
```

---

## Critical Gotchas

1. **Instagram hashtag limit is 5 in 2026** (was 30 in 2025). Do NOT revert.
2. **TikTok char limit is 4,000 in 2026** (was 2,200). Do NOT revert.
3. **Private key:** Always `.replace(/\\n/g, '\n')` when reading from env vars.
4. **JSON from Gemini:** Use `text.match(/\{[\s\S]*\}/)` — responses are often markdown-wrapped.
5. **Aspect ratios:** Use `getPlatformSpec()`, never hardcode. Instagram prefers 4:5 portrait.
6. **Supabase DB URL on Vercel:** Cloud SQL's private IP is unreachable from Vercel. Use `SUPABASE_DB_URL` (Transaction mode, port 6543).
7. **Better Auth `generateId`:** Must be a function `() => crypto.randomUUID()`. The string shorthand `"uuid"` is not supported in Better Auth 1.x.
8. **Better Auth `redirectURI`:** Do NOT override it. Better Auth auto-constructs it from `baseURL`. Overriding causes a silent 500 in the sign-in flow.

---

## Testing

```bash
# Manual API testing
npx ts-node scripts/test-api.ts

# Database setup (first time only)
npx ts-node scripts/test-setup.ts
```

No formal test suite yet. Add tests in `__tests__/` following Next.js conventions.

---

## File Organization

```bash
├── app/
│   ├── api/
│   │   ├── generate-post/    # Text + hashtag generation
│   │   ├── generate-image/   # Imagen 4.0 image generation
│   │   ├── generate-video/   # Veo 3.1 video generation
│   │   ├── validate-content/ # Platform constraint validation
│   │   ├── upload/           # GCS file upload
│   │   └── auth/[...all]/    # Better Auth handler
│   ├── login/                # Login page
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── post-generator.tsx    # Main form (client component)
│   ├── post-result.tsx       # Results display
│   ├── banner-editor/        # Banner editing feature
│   ├── editor/               # Editor components
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── services/
│   │   ├── imagen-service.ts
│   │   └── veo-service.ts
│   ├── database/             # Schema + service
│   ├── firebase/             # Firebase integration
│   ├── gcp/                  # GCP utilities
│   ├── i18n/                 # Internationalization
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
│   └── editor.ts             # Editor types
├── scripts/
│   ├── 001-auth-and-rate-limiting.sql  # DB setup script
│   ├── test-api.ts           # Manual API testing
│   ├── test-setup.ts         # Database initialization
│   └── vercel-env-manage.sh  # Vercel env management
└── public/
    └── images/               # Static assets
```

---

**Last Updated:** February 2026
**Organization:** TopNetworks, Inc.
