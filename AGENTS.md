# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview
Next.js 16 application that generates platform-optimized social media content using Google Gemini 2.5 Flash and Imagen 4.0. Creates posts with text, hashtags, and optional AI-generated images/videos for Instagram, Twitter/X, Facebook, TikTok, and LinkedIn.

## Development Commands

### Running the Application
```bash
npm run dev     # Development server on http://localhost:3050
npm run build   # Production build
npm run start   # Production server on port 3050
npm run lint    # Run ESLint
```

**Port Configuration**: Application runs on port **3050** (not 3000) to avoid conflicts with other TopNetworks applications.

### Testing
Use `scripts/test-api.ts` for testing API routes (NOT test-setup.ts which is for database setup).

### Database Setup
The database schema is located at `lib/database/schema.sql`. PostgreSQL with uuid-ossp extension is required.

## Architecture

### Service Layer Pattern
All external API integrations follow a centralized service class pattern:
- **`lib/google-client.ts`**: Google Cloud authentication with service account credentials fallback to ADC
- **`lib/services/imagen-service.ts`**: Image generation via Imagen 4.0 Ultra
- **`lib/services/veo-service.ts`**: Video generation via Veo 3.1
- **`lib/database/service.ts`**: PostgreSQL database operations

### Platform Specifications System (CRITICAL)
All platform constraints are centralized in `lib/social-platform-specs.ts` with 2026 specifications:
- Instagram: 2200 chars, **5 hashtags max** (down from 30 in 2025)
- Twitter: 280 chars standard (25K for Premium)
- Facebook: 63,206 chars
- TikTok: 4,000 chars (increased in 2026)
- LinkedIn: 3,000 chars

**ALWAYS** use `getPlatformSpec(platform)` to retrieve constraints. **NEVER** hardcode platform limits in your code.

### API Routes Pattern
All API routes in `app/api/*/route.ts` follow this standardized flow:
1. Validate request using platform specs
2. Build platform-specific system prompt with `getSystemPrompt(platform)`
3. Call Gemini with structured JSON output format
4. Parse & validate response against platform limits
5. Log tokens/cost using emoji-based console logging (🤖 ✅ ⚠️ ❌)

### Data Flow
```
User Input (PostGenerator)
  → POST /api/generate-post
  → getSystemPrompt(platform) + user prompt
  → Gemini 2.5 Flash
  → JSON parse & validate
  → (optional) POST /api/generate-image → ImagenService
  → PostResult display
```

## Type System

### Core Types
Located in `types/social-platforms.ts`:
- **Platform**: `'instagram' | 'twitter' | 'facebook' | 'tiktok' | 'linkedin'`
- **PostType**: `'promotional' | 'educational' | 'entertaining' | 'news' | 'announcement' | 'behind-the-scenes' | 'user-generated' | 'poll' | 'question'`
- **Tone**: `'casual' | 'professional' | 'friendly' | 'urgent' | 'inspiring' | 'humorous' | 'empathetic' | 'authoritative'`
- **ContentLength**: `'short' | 'medium' | 'long'`
- **ImageStyle**: `'product-photo' | 'lifestyle' | 'infographic' | 'illustration' | 'minimalist' | 'vibrant' | 'professional' | 'candid'`
- **VideoStyle**: `'dynamic' | 'cinematic' | 'tutorial' | 'behind-the-scenes' | 'product-showcase' | 'testimonial' | 'animated' | 'timelapse'`

### API Contracts
- **GeneratePostRequest**: Input parameters for post generation
- **GeneratePostResponse**: Output including content, hashtags, media prompts, and metadata (tokens, cost, generation time)
- **GeneratedPostData** (`types/generated-post.ts`): Database representation including both content and generation metadata

## Component Architecture

### State Management
- Client components use `'use client'` directive
- State flows: `PostGenerator` → `onPostGenerated` callback → `Home` state → `PostResult`
- No global state - uses props drilling (appropriate for this app's scope)

### UI Components
All components in `components/ui/` are from shadcn/ui:
- Import from `@/components/ui/button`, `@/components/ui/card`, etc.
- Use `className` with tailwind-merge via `cn()` utility from `lib/utils.ts`

## Development Patterns

### Validation Pattern
Always validate generated content using the validation utilities:
```typescript
import { validateTextContent, validateHashtags } from '@/lib/social-validators';
const validation = validateTextContent(platform, content);
// Returns: { valid, errors, warnings, stats }
```

### Cost Tracking
Every API call logs cost using Gemini 2.5 Flash pricing (see `generate-post/route.ts` lines 220-226):
```typescript
const costPerInputToken = 0.075 / 1_000_000;
const costPerOutputToken = 0.30 / 1_000_000;
const cost = (inputTokens * costPerInputToken) + (outputTokens * costPerOutputToken);
```

### Google Cloud Integration
- Uses `@google/genai` SDK (v1.38.0+) with vertexai mode
- Authentication: Service account credentials with `private_key.replace(/\\n/g, '\n')` transformation
- Model names: `gemini-2.5-flash`, `imagen-4.0-ultra-generate-001`, `veo-3.1-fast-generate-preview`

### Private Key Formatting
**ALWAYS** use `.replace(/\\n/g, '\n')` when reading `GOOGLE_PRIVATE_KEY` from environment variables.

### JSON Parsing from Gemini
Use regex `text.match(/\{[\s\S]*\}/)` to extract JSON from markdown-wrapped responses.

## Environment Variables
Required configuration in `.env.local`:
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

## Database Schema
PostgreSQL schema in `lib/database/schema.sql`:
- UUID primary keys with `uuid_generate_v4()`
- JSONB for flexible metadata storage
- TEXT[] arrays for hashtags
- Foreign key cascade deletes for images/videos
- Views for analytics: `recent_activity`, `platform_statistics`

## TopNetworks Product Standards

### Visual Identity
- Favicon and brand assets from EmailGenius project
- Color palette: Blue (#2563eb), Green (#84cc16), Cyan (#06b6d4)
- Header gradient: `from-blue-600 to-cyan-600` (TopNetworks colors)
- Tailwind configuration with TopNetworks brand colors in globals.css

### Localization
- **UI Language**: Spanish (not English)
- All user-facing text must be in Spanish
- Localized components: `page.tsx`, `post-generator.tsx`, `post-result.tsx`

### Brand Alignment
Follows EmailGenius design system and UI patterns for consistency across TopNetworks ecosystem.

## File Organization
- `/app`: Next.js App Router pages and API routes
  - `/app/api/generate-post`: Text content generation
  - `/app/api/generate-image`: Image generation via Imagen
  - `/app/api/generate-video`: Video generation via Veo
  - `/app/api/validate-content`: Content validation endpoint
- `/components`: React components (`ui/` subfolder for shadcn components)
- `/lib`: Business logic, services, utilities, database
  - `/lib/services/`: API service classes
  - `/lib/database/`: Database schema and service
- `/types`: TypeScript type definitions
- `/public`: Static assets
- `/scripts`: Development/testing utilities

## Critical Gotchas

### Instagram Hashtag Limit
Changed to **5 in 2026** (was 30). Code is already updated - do NOT revert this change.

### Platform Validation
Always validate content after generation. Gemini can hallucinate invalid content that exceeds platform limits.

### Aspect Ratios
Use platform specs from `social-platform-specs.ts`, never hardcode values. Instagram prefers 4:5 portrait, not always 1:1.

### Image Generation Flow
1. Text generation in `/api/generate-post` creates `imagePrompt`
2. Client calls `/api/generate-image` with prompt + platform
3. `ImagenService` uses platform aspect ratio from specs
4. Returns base64 data URL or stores in database
