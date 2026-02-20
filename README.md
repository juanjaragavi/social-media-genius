# Social Media Genius

<p align="center">
  <img src="https://storage.googleapis.com/media-topfinanzas-com/favicon.png" alt="TopNetworks Logo" width="200">
</p>

**Social Media Genius** is an AI-powered content generation platform by [TopNetworks](https://topnetworks.com) that creates optimized social media posts for multiple platforms using Google Gemini 2.5 Flash and Imagen 4.0.

## ✨ Features

- � **Canva-Style Visual Editor**: Full-screen canvas editor with drag, resize, transform, zoom, and keyboard shortcuts (Konva-powered)
- 🎯 **Platform-Optimized Content**: Generates posts tailored for Instagram, Twitter/X, Facebook, TikTok, and LinkedIn
- 🤖 **AI-Powered Generation**: Uses Google Gemini 2.5 Flash for intelligent content creation
- 🖼️ **AI Image Generation**: Creates platform-specific images using Imagen 4.0 Ultra
- 🎥 **AI Video Generation**: Creates videos using Veo 3.1
- 📝 **AI Canvas Editing**: Edit canvas elements with natural language via Gemini
- 📊 **2026 Platform Specs**: Up-to-date character limits, hashtag constraints, and media requirements
- 📰 **Campaign Mode**: Generate primary + secondary + tertiary banner sets in one operation
- 🌐 **Spanish UI / Multilingual Output**: UI in Spanish, AI-generated content in EN, ES, and BR
- 🔒 **Google OAuth Authentication**: Domain-restricted access (Better Auth 1.x)
- 💰 **Cost Tracking**: Real-time token usage and cost estimation

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4
- **Canvas**: react-konva / Konva (2D canvas editor)
- **AI Models**: Google Vertex AI (Gemini 2.5 Flash, Imagen 4.0 Ultra, Veo 3.1)
- **Auth**: Better Auth 1.x (Google OAuth)
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL (Supabase on Vercel, Cloud SQL local)
- **Color Picker**: react-colorful

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Google Cloud Project with Vertex AI enabled
- Service account credentials

### Environment Variables

Create a `.env.local` file:

```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Installation

```bash
# Install dependencies
npm install

# Run development server (port 3050)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3050](http://localhost:3050) to view the application.

## 🌿 Branching Strategy & Environments

This project follows a strict three-tier branch architecture to ensure code quality and deployment safety:

- **`dev` (Development)**: The primary branch for all active development. All feature branches, bug fixes, and experimental code must be merged here first. This environment is used for initial testing and integration.
- **`staging` (Pre-production)**: The release candidate branch. Code is merged from `dev` to `staging` for final QA, user acceptance testing (UAT), and performance validation in an environment that mirrors production.
- **`main` (Production)**: The stable, production-ready branch. Only thoroughly tested code from `staging` is merged here. Direct commits or pushes to `main` are strictly prohibited.

**Workflow:** `Feature Branch` → `dev` → `staging` → `main`

## � Git Workflow

All commits and pushes **must** go through the automated workflow script:

```bash
bash scripts/git-workflow.sh "<commit message>"
```

Do **not** run raw `git add`, `git commit`, or `git push` commands. The script enforces:

- Conventional commit format
- Branch protection (main, staging, production)
- Pre-push validation: TypeScript type-check, ESLint, Prettier
- Rebase-first strategy with conflict detection

See [CONTRIBUTING.md](CONTRIBUTING.md) for full details and available flags.

## �📁 Project Structure

```bash
├── app/
│   ├── api/
│   │   ├── generate-post/     # Text + hashtag + banner generation
│   │   ├── generate-image/    # Imagen 4.0 image generation
│   │   ├── generate-video/    # Veo 3.1 video generation
│   │   ├── ai-edit/           # AI-powered canvas editing
│   │   ├── validate-content/  # Platform constraint validation
│   │   ├── upload/            # GCS file upload
│   │   └── auth/[...all]/     # Better Auth handler
│   ├── login/                 # Login page (Google OAuth)
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── editor/                # Canva-style visual editor (primary UI)
│   │   ├── editor-layout.tsx
│   │   ├── canvas-context.tsx
│   │   ├── interactive-canvas.tsx
│   │   ├── top-toolbar.tsx
│   │   ├── icon-rail.tsx
│   │   ├── sidebar-panel.tsx
│   │   ├── inline-properties-panel.tsx
│   │   ├── properties-panel.tsx
│   │   └── panels/            # Generate, Templates, Elements, Text, Media, Layers
│   ├── banner-editor/         # Legacy monolithic banner editor
│   ├── post-generator.tsx     # Legacy standalone form
│   ├── post-result.tsx        # Legacy standalone results
│   └── ui/                    # shadcn/ui + platform icons
├── lib/
│   ├── services/              # imagen-service, veo-service, google-drive, supabase
│   ├── database/              # Schema + service
│   ├── i18n/                  # Internationalization (EN, ES, BR)
│   ├── social-platform-specs.ts   # Platform constraints (source of truth)
│   ├── social-validators.ts      # Content validation
│   └── auth.ts                # Better Auth server config
├── types/
│   ├── social-platforms.ts    # Platform enums and API contracts
│   ├── generated-post.ts      # Database types
│   └── editor.ts              # Editor types + BANNER_DIMENSIONS
├── scripts/
│   ├── git-workflow.sh        # Automated git workflow (required for all pushes)
│   └── test-api.ts            # Manual API testing
└── docs/
    ├── ui-ux-changelog.md     # UI/UX documentation
    └── vercel-env-protocol.md # Environment variable protocol
```

## 📋 Platform Specifications (2026)

| Platform  | Max Characters    | Hashtag Limit   | Image Aspect Ratio |
| --------- | ----------------- | --------------- | ------------------ |
| Instagram | 2,200             | 5               | 4:5 (portrait)     |
| Twitter/X | 280 (25K Premium) | No strict limit | 16:9               |
| Facebook  | 63,206            | No strict limit | 1.91:1             |
| TikTok    | 4,000             | 30              | 9:16               |
| LinkedIn  | 3,000             | No strict limit | 1.91:1             |

## 🔗 Related Projects

- [EmailGenius](https://email.topfinanzas.com) - AI-powered email broadcast generator

## 📄 License

© 2026 TopNetworks. All rights reserved.
