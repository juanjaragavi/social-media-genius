# Social Media Genius

<p align="center">
  <img src="https://storage.googleapis.com/media-topfinanzas-com/favicon.png" alt="TopNetworks Logo" width="200">
</p>

**Social Media Genius** is an AI-powered content generation platform by [TopNetworks](https://topnetworks.com) that creates optimized social media posts for multiple platforms using Google Gemini 2.5 Flash and Imagen 4.0.

## ✨ Features

- 🎯 **Platform-Optimized Content**: Generates posts tailored for Instagram, Twitter/X, Facebook, TikTok, and LinkedIn
- 🤖 **AI-Powered Generation**: Uses Google Gemini 2.5 Flash for intelligent content creation
- 🎨 **AI Image Generation**: Creates platform-specific images using Imagen 4.0 Ultra
- 📊 **2026 Platform Specs**: Up-to-date character limits, hashtag constraints, and media requirements
- 🌐 **Spanish UI**: Fully localized interface in Spanish
- 💰 **Cost Tracking**: Real-time token usage and cost estimation

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI Models**: Google Vertex AI (Gemini 2.5 Flash, Imagen 4.0 Ultra)
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL with uuid-ossp extension

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

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── generate-post/     # Text content generation
│   │   ├── generate-image/    # AI image generation
│   │   ├── generate-video/    # Video generation (Veo 3.1)
│   │   └── validate-content/  # Content validation
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── post-generator.tsx     # Main form component
│   ├── post-result.tsx        # Results display
│   └── ui/                    # shadcn/ui components
├── lib/
│   ├── services/
│   │   ├── imagen-service.ts  # Imagen 4.0 integration
│   │   └── veo-service.ts     # Veo 3.1 integration
│   ├── social-platform-specs.ts  # Platform constraints
│   └── social-validators.ts   # Content validation
└── types/
    └── social-platforms.ts    # TypeScript definitions
```

## 📋 Platform Specifications (2026)

| Platform  | Max Characters    | Hashtag Limit | Image Aspect Ratio |
| --------- | ----------------- | ------------- | ------------------ |
| Instagram | 2,200             | 5             | 3:4 (portrait)     |
| Twitter/X | 280 (25K Premium) | Unlimited     | 16:9               |
| Facebook  | 63,206            | 30            | 16:9               |
| TikTok    | 4,000             | Unlimited     | 9:16               |
| LinkedIn  | 3,000             | 5             | 16:9               |

## 🔗 Related Projects

- [EmailGenius](https://email.topfinanzas.com) - AI-powered email broadcast generator

## 📄 License

© 2026 TopNetworks. All rights reserved.
