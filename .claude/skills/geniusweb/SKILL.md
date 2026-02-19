---
name: geniusweb
description: GeniusWeb is TopNetworks Inc.'s LLM-powered website, blog, and landing page creation system. Use this skill when building new financial comparison platforms, content sites, or marketing properties for TopNetworks brands (TopFinanzas, BudgetBee, KardTrust, etc.). Implements brand identity, proven design patterns, and performance-optimized architecture from successful TopNetworks products.
---

# GeniusWeb — TopNetworks Website Creator

Build production-ready financial websites, blogs, and landing pages that follow TopNetworks Inc.'s proven patterns for performance publishing and advertising arbitrage.

## Scope

**Use for:**

- New market expansions (US, UK, Mexico, Latin America financial sites)
- Financial comparison platforms (credit cards, loans, personal finance)
- Content-driven blogs with SEO optimization
- Landing pages for financial products
- Quiz/recommender tools for lead generation
- Internal tools and dashboards (EmailGenius, RouteGenius style)

**Not for:**

- E-commerce platforms
- Social networks
- Non-financial industries (unless specifically requested)
- Complex SaaS applications (use dedicated patterns)

---

# TopNetworks Business Context

## Company Overview

**TopNetworks, Inc.** is a performance publishing company operating in the advertising arbitrage space:

- **Business Model:** Connect high-intent customers with financial advertisers
- **Revenue:** Cost per acquisition (CPA), lead generation, display advertising
- **Traffic:** Meta Ads, Google Ads, programmatic networks
- **Markets:** United States, United Kingdom, Mexico, Latin America
- **Core Vertical:** Financial comparison and education (credit cards, personal loans, budgeting)

## Successful Products

Before building anything new, study these proven implementations:

### 1. TopFinanzas (Multi-Market)

- **Stack:** Next.js 15+ (App Router), TypeScript, Tailwind CSS
- **Markets:** US (us.topfinanzas.com), UK (uk.topfinanzas.com), Mexico (topfinanzas.com/mx/)
- **Content:** 80+ credit card pages, blog, financial guides
- **Analytics:** GTM, Google Ads, AdZep, TopAds integration
- **Key Features:** Multi-step recommender quiz, in-memory search, market-specific compliance

### 2. BudgetBee (budgetbeepro.com)

- **Target:** Gen-Z and Millennials
- **Brand:** Friendly bee mascot, golden yellow (#E6B432) + black
- **Value Prop:** "Your Hive for Unbiased Financial Buzz"
- **Design:** Warm, approachable, hexagonal patterns
- **Tone:** Conversational, non-judgmental, empowering

### 3. MejoresFinanzas (mejoresfinanzas.com)

- **Stack:** Astro 5.0 + Tailwind CSS (static-first)
- **Market:** Latin America (Spanish es-US)
- **Port:** 4322
- **Content:** Financial blog, SEO-optimized articles, cornerstone content
- **Features:** Fast static generation, MDX support, category system

### 4. EmailGenius (email.topfinanzas.com)

- **Purpose:** Internal AI email marketing tool
- **Stack:** Next.js 15+, Vertex AI (Gemini 2.5 Flash), PostgreSQL
- **Brand:** Tri-color gradient (blue → cyan → lime)
- **Design:** Professional, technology-forward, vibrant
- **Features:** AI generation, image creation (Imagen 4.0), multi-market support

### 5. Financial Blog Template

- **Purpose:** Reusable template for rapid market expansion
- **Stack:** Astro 5.0 + Tailwind CSS
- **Features:** 10+ pre-designed pages, quiz scaffolding, pagination, Spanish localization
- **Usage:** Clone and customize for new markets

---

# Technology Stack Selection

Choose the right stack based on project requirements:

## Next.js 15+ (App Router)

**Use when:**

- Dynamic content and user interactions required
- Multi-step forms (quizzes, recommenders)
- API integrations (Google Sheets, email services, analytics)
- Server-side rendering (SSR) benefits SEO
- Real-time data or personalization needed

**Ports:**

- 3000: Default (avoid conflicts)
- 3004: uk-topfinanzas-com
- 3020: emailgenius-broadcasts-generator
- 3040: topfinanzas-us-next
- 3070: route-genius

**Key Dependencies:**

```json
{
  "next": "^15.0.0",
  "react": "^19.0.0",
  "typescript": "^5.0.0",
  "tailwindcss": "^4.0.0",
  "@radix-ui/react-*": "latest",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0"
}
```

## Astro 5.0

**Use when:**

- Content-first website (blogs, marketing sites)
- Static generation priority for performance
- Minimal JavaScript needed
- SEO is critical
- Fast page loads required

**Ports:**

- 4322: mejoresfinanzas
- 4321: Default Astro port

**Key Dependencies:**

```json
{
  "astro": "^5.0.0",
  "@astrojs/mdx": "latest",
  "@astrojs/react": "latest",
  "@astrojs/sitemap": "latest",
  "@astrojs/tailwind": "latest",
  "tailwindcss": "^4.0.0"
}
```

---

# Brand Identity System

## TopNetworks/TopFinanzas Core Brand

### Color Palette

```typescript
// Tailwind config
colors: {
  brand: {
    blue: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',  // Primary
      700: '#1d4ed8',
      800: '#1e3a5f'
    },
    cyan: {
      50: '#ecfeff',
      500: '#06b6d4',
      600: '#0891b2',  // Secondary
      700: '#0e7490'
    },
    lime: {
      50: '#f7fee7',
      500: '#84cc16',  // Accent
      600: '#65a30d',
      700: '#4d7c0f'
    }
  }
}
```

### Typography

```typescript
// Poppins font (primary for all TopNetworks properties)
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-poppins",
});
```

### Gradients

```css
/* Tri-color brand gradient (headlines, CTAs) */
.brand-gradient-text {
  @apply bg-gradient-to-r from-blue-600 via-cyan-600 to-lime-600 
         bg-clip-text text-transparent;
}

/* Background gradient (full page) */
.brand-gradient-bg {
  @apply bg-gradient-to-br from-lime-50 via-cyan-50 to-blue-100;
}

/* Button gradient */
.brand-gradient-button {
  @apply bg-gradient-to-r from-blue-600 to-cyan-600 
         hover:from-blue-700 hover:to-cyan-700;
}
```

### Logo Assets

```typescript
// Always use Google Cloud Storage CDN
const TOPNETWORKS_LOGO =
  "https://storage.googleapis.com/media-topfinanzas-com/images/topnetworks-positivo-sinfondo.webp";
const FAVICON =
  "https://storage.googleapis.com/media-topfinanzas-com/favicon.png";
```

## BudgetBee Brand

### Color Palette

```typescript
colors: {
  budgetbee: {
    gold: '#E6B432',      // Primary (bee/honey theme)
    black: '#000000',     // Wordmark, text
    white: '#FFFFFF',     // Backgrounds
    teal: '#3DAAAA',      // Charts, accents
    orange: '#F4A261',    // Warm accents
    navy: '#003DA5'       // Trust indicators
  }
}
```

### Brand Elements

- **Mascot:** Friendly cartoon bee in hexagonal logo
- **Shapes:** Hexagons (honeycomb/hive structure)
- **Personality:** Helpful, non-judgmental, community-oriented
- **Tone:** Conversational, empowering, warm

## KardTrust Brand

### Color Palette

```typescript
colors: {
  kardtrust: {
    primary: '#1e40af',   // Trust blue
    secondary: '#06b6d4', // Cyan accent
    success: '#22c55e',   // Approval green
    warning: '#f59e0b'    // Caution amber
  }
}
```

---

# Market-Specific Localization

## United States (US)

```typescript
{
  language: 'en-US',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  domain: 'us.topfinanzas.com',
  emailSender: 'topfinance@topfinanzas.com',
  compliance: ['CCPA', 'CAN-SPAM Act'],
  analytics: {
    utm: 'us_tf_[platform]_broad'
  }
}
```

## United Kingdom (UK)

```typescript
{
  language: 'en-GB',
  currency: 'GBP',
  dateFormat: 'DD/MM/YYYY',
  domain: 'uk.topfinanzas.com',
  emailSender: 'topfinance@topfinanzas.com',
  compliance: ['FCA', 'GDPR'],
  terminology: {
    // UK-specific financial terms
    apr: 'Representative APR',
    creditCard: 'Credit Card',
    loanDisclosure: 'Representative Example required'
  }
}
```

## Mexico (MX)

```typescript
{
  language: 'es-MX',
  currency: 'MXN',
  dateFormat: 'DD/MM/YYYY',
  domain: 'topfinanzas.com/mx/',  // NOT mx.topfinanzas.com
  emailSender: 'info@topfinanzas.com',
  compliance: ['CONDUSEF', 'PROFECO'],
  terminology: {
    creditCard: 'Tarjeta de Crédito',
    loan: 'Préstamo Personal',
    cat: 'CAT (Costo Anual Total)'
  }
}
```

## Latin America (LatAm)

```typescript
{
  language: 'es-US',
  currency: 'varies',
  domain: 'mejoresfinanzas.com',
  target: 'Multi-country Spanish-speaking audience',
  tone: 'Educational, accessible, regional neutrality'
}
```

---

# Architecture Patterns

## Next.js App Router Pattern

### Directory Structure

```
app/
├── (routes)/              # Route groups
├── api/                   # API endpoints
│   ├── contact/
│   ├── subscribe/
│   └── sheets/
├── blog/                  # Blog listing
├── personal-finance/      # Category listing
├── financial-solutions/   # Product pages
├── layout.tsx             # Root layout
├── page.tsx               # Homepage
└── globals.css            # Global styles

components/
├── analytics/             # GTM, AdZep, TopAds
├── forms/                 # Contact, subscription
├── layout/                # Header, footer, nav
├── steps/                 # Multi-step forms
└── ui/                    # Shadcn/UI components

lib/
├── contexts/              # React contexts
├── navigation/            # Nav utilities
├── utils/                 # Helper functions
└── logger.ts              # Pino logging
```

### Critical Rules

#### Logging (NEVER use console.log)

```typescript
// ❌ WRONG
console.log("User data:", userData);

// ✅ CORRECT
import { logger } from "@/lib/logger";
logger.info({ userData }, "User data retrieved");
```

#### Analytics Integration

```typescript
// GTM loads FIRST in layout
<Script src={gtmScriptUrl} strategy="afterInteractive" />

// AdZep NEVER call manually - auto-activates via component
<AdZepNavigationHandler />

// UTM format: [country]_tf_[platform]_broad
const utmCampaign = 'us_tf_meta_broad';
```

#### Multi-Step Forms

```typescript
// Always scroll to top on step changes
window.scrollTo(0, 0);

// State management: React Hook Form + Zod
const form = useForm<FormData>({
  resolver: zodResolver(schema),
});

// Persistence: localStorage + cookie dual storage
```

## Astro 5.0 Pattern

### Directory Structure

```
src/
├── content/
│   ├── post/              # MDX blog posts
│   └── config.ts          # Content collections
├── layouts/
│   ├── Layout.astro       # Base layout
│   ├── MarkdownLayout.astro
│   └── PageLayout.astro
├── pages/
│   ├── [...blog]/         # Blog routes
│   ├── index.astro        # Homepage
│   ├── rss.xml.ts         # RSS feed
│   └── 404.astro
├── components/
│   ├── blog/
│   ├── ui/
│   └── widgets/
├── config/
│   ├── brand.ts           # Brand config
│   ├── config.json        # Site config
│   └── theme.json         # Theme tokens
└── assets/
    ├── images/
    └── styles/
```

### Configuration Pattern

```typescript
// astro.config.mjs
export default defineConfig({
  site: 'https://example.com',
  integrations: [
    react(),
    sitemap({
      customPages: [...],
      serialize: (item) => ({
        url: item.url,
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString()
      })
    }),
    mdx()
  ],
  markdown: {
    remarkPlugins: [remarkToc, remarkCollapse],
    shikiConfig: { theme: 'one-dark-pro' }
  }
});
```

---

# Component Patterns

## Shadcn/UI Components (Next.js)

### Installation

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input label select textarea
```

### Usage Pattern

```typescript
// components/ui/button.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center",
          "rounded-md text-sm font-medium",
          "transition-colors focus-visible:outline-none",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
```

## Analytics Components

### Google Tag Manager

```typescript
// components/analytics/GTMScript.tsx
'use client';

export default function GTMScript() {
  return (
    <Script
      id="gtm-script"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){...})(window,document,'script','dataLayer','GTM-XXXXX');`
      }}
    />
  );
}
```

### AdZep Auto-Activation

```typescript
// components/analytics/AdZepNavigationHandler.tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function AdZepNavigationHandler() {
  const pathname = usePathname();

  useEffect(() => {
    // AdZep activates automatically on navigation
    // NEVER call window.AdZepActivateAds() manually
  }, [pathname]);

  return null;
}
```

---

# Content Patterns

## Financial Product Pages

### Structure (SEO-Critical)

```typescript
// Must follow exact layout standard
// Template: /app/financial-solutions/barclaycard-avios-plus/

// Benefits Page
- Hero section with product image
- Key benefits (NO colored boxes, NO grids, NO bullet lists)
- Detailed features
- Application CTA
- Ad units (uk_topfinanzas_3, uk_topfinanzas_4)

// Requirements Page
- Eligibility criteria
- Application requirements
- Representative example (APR, terms)
- Regulatory disclaimers
```

### Image Component Usage

```typescript
// Use ResponsiveImage for hero/featured images
import { ResponsiveImage } from '@/components/ResponsiveImage';

<ResponsiveImage
  src="https://storage.googleapis.com/media-topfinanzas-com/images/card-name.webp"
  alt="Product Name Credit Card"
  width={600}
  height={400}
  priority
/>

// Use next/image for inline content images
import Image from 'next/image';

<Image
  src="/images/feature-icon.svg"
  alt="Feature description"
  width={48}
  height={48}
/>
```

## Blog Post Pattern

### Frontmatter

```yaml
---
title: "How to Choose the Best Credit Card for Your Lifestyle"
description: "Discover the key factors to consider when selecting a credit card that matches your spending habits and financial goals."
date: 2026-02-12
category: personal-finance
author: TopFinanzas Team
image: /images/blog/credit-card-guide.webp
tags:
  - credit cards
  - personal finance
  - financial planning
draft: false
lang: en-US
---
```

### Multi-Array Synchronization

```typescript
// CRITICAL: Update ALL allPosts arrays when adding blog content
// Locations:
// - /app/blog/page.tsx
// - /app/personal-finance/page.tsx
// - /app/financial-solutions/page.tsx
// - Homepage recent posts
// - Sidebar widgets
// - Search index (lib/search-index.ts)
```

---

# Performance Optimization

## Image Optimization

### Next.js Config

```typescript
// next.config.mjs
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'storage.googleapis.com',
      pathname: '/media-topfinanzas-com/**',
    },
    {
      protocol: 'https',
      hostname: 'us.topfinanzas.com',
    },
    {
      protocol: 'https',
      hostname: 'uk.topfinanzas.com',
    }
  ],
  formats: ['image/avif', 'image/webp'],
  minimumCacheTTL: 31536000, // 1 year
}
```

### Usage

```typescript
// Always use next/image for optimization
import Image from 'next/image';

<Image
  src="https://storage.googleapis.com/media-topfinanzas-com/images/hero.webp"
  alt="Financial guidance"
  width={1200}
  height={630}
  priority={isAboveFold}
  loading={isAboveFold ? 'eager' : 'lazy'}
/>
```

## Build Optimization

### Next.js Config

```typescript
// next.config.mjs
webpack: (config, { isServer }) => {
  config.optimization = {
    ...config.optimization,
    moduleIds: 'deterministic',
  };
  return config;
},
experimental: {
  optimizeCss: true,
  webpackBuildWorker: true,
  parallelServerCompiles: true,
  parallelServerBuildTraces: true,
}
```

### Package Import Optimization

```typescript
optimizePackageImports: [
  "next/font",
  "framer-motion",
  "lucide-react",
  "@radix-ui/react-*",
];
```

---

# SEO Configuration

## Metadata Pattern (Next.js)

```typescript
// app/layout.tsx or page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "TopFinanzas - Financial Comparison & Education",
    template: "%s | TopFinanzas",
  },
  description:
    "Compare credit cards, personal loans, and financial products. Unbiased guidance for smarter financial decisions.",
  keywords: [
    "credit cards",
    "personal loans",
    "financial comparison",
    "budgeting",
  ],
  authors: [{ name: "TopNetworks, Inc." }],
  creator: "TopNetworks, Inc.",
  publisher: "TopNetworks, Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://us.topfinanzas.com",
    siteName: "TopFinanzas",
    title: "TopFinanzas - Financial Comparison & Education",
    description:
      "Compare credit cards, personal loans, and financial products.",
    images: [
      {
        url: "https://storage.googleapis.com/media-topfinanzas-com/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "TopFinanzas Open Graph Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TopFinanzas - Financial Comparison & Education",
    description:
      "Compare credit cards, personal loans, and financial products.",
    images: [
      "https://storage.googleapis.com/media-topfinanzas-com/images/twitter-card.png",
    ],
  },
  alternates: {
    canonical: "https://us.topfinanzas.com",
    languages: {
      "en-US": "https://us.topfinanzas.com",
      "en-GB": "https://uk.topfinanzas.com",
      "es-MX": "https://topfinanzas.com/mx/",
    },
  },
};
```

## Sitemap Configuration (Astro)

```typescript
// astro.config.mjs
sitemap({
  customPages: [
    "https://example.com/",
    "https://example.com/blog/",
    "https://example.com/personal-finance/",
    "https://example.com/financial-solutions/",
  ],
  serialize: (item) => {
    const path = item.url.replace("https://example.com", "");

    // High-priority pages
    if (path === "/") {
      return {
        url: item.url,
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString().split("T")[0],
      };
    }

    // Content hubs
    if (
      ["/blog/", "/personal-finance/", "/financial-solutions/"].includes(path)
    ) {
      return {
        url: item.url,
        changefreq: "weekly",
        priority: 0.9,
        lastmod: new Date().toISOString().split("T")[0],
      };
    }

    // Default
    return {
      url: item.url,
      changefreq: "monthly",
      priority: 0.7,
      lastmod: new Date().toISOString().split("T")[0],
    };
  },
});
```

---

# Environment Configuration

## Required Variables

### Next.js (.env.local)

```bash
# Google Cloud (for EmailGenius, analytics)
GOOGLE_CLOUD_PROJECT=absolute-brook-452020-d5
GOOGLE_SERVICE_ACCOUNT_EMAIL=sheets-service-account@absolute-brook-452020-d5.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Database (if using PostgreSQL)
DB_HOST=34.16.99.221
DB_PORT=5432
DB_NAME=database_name
DB_USER=postgres
DB_PASSWORD=your_password

# Email Services
BREVO_API_KEY=your_brevo_api_key
CONVERTKIT_API_KEY=your_convertkit_api_key

# Analytics
NEXT_PUBLIC_GTM_ID=GTM-XXXXX
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Application
PORT=3040
NODE_ENV=production
NEXT_PUBLIC_SITE_URL=https://us.topfinanzas.com
```

### Astro (.env)

```bash
# Site Configuration
PUBLIC_SITE_URL=https://mejoresfinanzas.com
PUBLIC_SITE_NAME=MejoresFinanzas

# Analytics
PUBLIC_GA_ID=G-XXXXXXXXXX

# Application
PORT=4322
```

---

# Deployment Patterns

## PM2 Deployment (Production Next.js)

### ecosystem.config.js

```javascript
module.exports = {
  apps: [
    {
      name: "topfinanzas-us",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3040",
      cwd: "/var/www/html/topfinanzas-us-next",
      instances: 1,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        PORT: 3040,
      },
      error_file: "/var/www/html/topfinanzas-us-next/logs/error.log",
      out_file: "/var/www/html/topfinanzas-us-next/logs/output.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
```

### Deployment Commands

```bash
# Navigate to project
cd /var/www/html/project-name

# Pull latest changes (as www-data user)
sudo -u www-data git pull origin main

# Install dependencies
sudo -u www-data npm install

# Build application
sudo -u www-data npm run build

# Restart PM2 process
sudo -u www-data pm2 restart project-name

# Verify deployment
sudo -u www-data pm2 status
sudo -u www-data pm2 logs project-name --lines 50
```

## Vercel Deployment (Next.js)

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "rewrites": [
    {
      "source": "/favicon.png",
      "destination": "https://storage.googleapis.com/media-topfinanzas-com/favicon.png"
    }
  ]
}
```

## Netlify Deployment (Astro)

### netlify.toml

```toml
[build]
  command = "pnpm build"
  publish = "dist"

[[redirects]]
  from = "/personal-finance/*"
  to = "/finanzas-personales/:splat"
  status = 301

[[redirects]]
  from = "/financial-solutions/*"
  to = "/soluciones-financieras/:splat"
  status = 301

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

---

# Git Workflow (CRITICAL)

## Automated Workflow Script

```bash
# NEVER bypass this script for commits/deployments
bash ./scripts/git-workflow.sh
```

### What the script does:

1. Reads commit message from `/lib/documents/commit-message.txt`
2. Auto-commits to dev branch first
3. Optionally merges to main and backup branches
4. Handles merge conflicts automatically

### Branch Strategy

- **dev** - Development branch (work here)
- **main** - Production-ready code
- **backup** - Automated backups (some repos)

### Manual Workflow (if no script)

```bash
# Stage changes
git add .

# Commit with conventional message
git commit -m "feat(pages): add credit card comparison page

- Implement responsive layout
- Add financial product metadata
- Integrate analytics tracking"

# Push to remote
git push origin dev
```

---

# Testing & Quality Assurance

## Pre-Deployment Checklist

### TypeScript & Code Quality

```bash
# Type check
npm run lint

# Format check
npm run format

# Build check
npm run build
```

### Manual Testing

- [ ] TypeScript strict mode compliance
- [ ] No `console.log()` statements (use logger)
- [ ] Mobile-first responsive design
- [ ] Accessibility attributes present
- [ ] Images optimized with `next/image`
- [ ] Analytics tracking implemented
- [ ] Market-specific terminology correct
- [ ] Instruction files followed
- [ ] Search index updated (if applicable)
- [ ] Blog arrays synced (if applicable)

### API Endpoint Testing

```bash
# Test Brevo integration
npm run test:brevo

# Test contact form
curl -X POST http://localhost:3040/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

### Performance Testing

```bash
# Lighthouse CI
npm install -g @lhci/cli
lhci autorun --collect.url=http://localhost:3040

# Check bundle size
npm run build
du -sh .next/static/*
```

---

# Design System Tokens

## Spacing Scale

```css
/* Tailwind spacing (default) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

## Border Radius

```css
--radius-sm: 0.25rem; /* 4px */
--radius-md: 0.375rem; /* 6px */
--radius-lg: 0.5rem; /* 8px */
--radius-xl: 0.75rem; /* 12px */
--radius-2xl: 1rem; /* 16px */
```

## Typography Scale

```css
/* Tailwind text sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */
```

## Shadow System

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
```

---

# Common Patterns & Snippets

## Hero Section (Homepage)

```tsx
// Tri-color gradient headline
<section className="relative overflow-hidden bg-gradient-to-br from-lime-50 via-cyan-50 to-blue-100">
  <div className="container mx-auto px-4 py-16">
    <h1 className="text-4xl md:text-6xl font-bold mb-6">
      <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-lime-600 bg-clip-text text-transparent">
        Find Your Perfect Credit Card
      </span>
    </h1>
    <p className="text-xl text-gray-600 mb-8 max-w-2xl">
      Compare top credit cards and discover financial products tailored to your
      lifestyle. Unbiased guidance from TopFinanzas.
    </p>
    <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
      Get Started
    </button>
  </div>
</section>
```

## Feature Grid

```tsx
// Financial features with icons
<div className="grid md:grid-cols-3 gap-8 py-16">
  {features.map((feature) => (
    <div
      key={feature.id}
      className="p-6 rounded-xl bg-white shadow-md hover:shadow-xl transition-shadow"
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-lime-500 to-cyan-500 flex items-center justify-center mb-4">
        <feature.icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
      <p className="text-gray-600">{feature.description}</p>
    </div>
  ))}
</div>
```

## CTA Section

```tsx
// Conversion-focused call-to-action
<section className="bg-gradient-to-r from-blue-600 to-cyan-600 py-16">
  <div className="container mx-auto px-4 text-center">
    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
      Ready to Find Your Perfect Card?
    </h2>
    <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
      Join thousands who have made smarter financial decisions with TopFinanzas
    </p>
    <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors shadow-xl">
      Start Comparison
    </button>
  </div>
</section>
```

## Blog Card

```tsx
// Blog post preview card
<Link href={`/blog/${post.slug}`} className="group block">
  <div className="rounded-xl overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-200">
    <div className="relative h-48 overflow-hidden">
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-200"
      />
    </div>
    <div className="p-6">
      <span className="text-sm font-medium text-cyan-600 uppercase tracking-wide">
        {post.category}
      </span>
      <h3 className="text-xl font-semibold mt-2 mb-3 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h3>
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {post.description}
      </p>
      <div className="flex items-center text-sm text-gray-500">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span className="mx-2">•</span>
        <span>{post.readTime}</span>
      </div>
    </div>
  </div>
</Link>
```

---

# Decision Framework

When building a new TopNetworks website, follow this decision tree:

## 1. Determine Project Type

**Content-First Blog/Marketing Site?**
→ Use **Astro 5.0**

- Static generation
- Minimal JavaScript
- SEO priority
- Fast page loads

**Dynamic App with User Interactions?**
→ Use **Next.js 15+ (App Router)**

- Multi-step forms
- API integrations
- Real-time features
- Server-side rendering

## 2. Choose Market & Localization

**US Market?**

- Language: en-US
- Domain: us.topfinanzas.com or budgetbeepro.com
- Currency: USD ($)
- Compliance: CCPA, CAN-SPAM

**UK Market?**

- Language: en-GB
- Domain: uk.topfinanzas.com
- Currency: GBP (£)
- Compliance: FCA, GDPR
- Terminology: UK-specific financial terms

**Mexico Market?**

- Language: es-MX
- Domain: topfinanzas.com/mx/
- Currency: MXN ($)
- Compliance: CONDUSEF, PROFECO
- Terminology: CAT, tarjetas de crédito

**Latin America (Multi-Market)?**

- Language: es-US
- Domain: mejoresfinanzas.com
- Regional neutrality
- Educational focus

## 3. Select Brand Identity

**TopFinanzas/TopNetworks Core Brand?**

- Tri-color gradient (blue → cyan → lime)
- Professional, technology-forward
- Poppins typography
- High-performance financial comparison

**BudgetBee Brand?**

- Golden yellow (#E6B432) + black
- Friendly bee mascot
- Hexagonal patterns
- Warm, conversational tone
- Gen-Z/Millennial audience

**KardTrust Brand?**

- Trust blue + cyan accent
- Credit card focus
- Security-oriented
- Multi-market compatibility

## 4. Plan Content Architecture

**Blog-Heavy Site?**

- Implement category system (Personal Finance, Financial Solutions)
- Use MDX for content
- Configure pagination
- Multi-array synchronization for posts

**Product Comparison Site?**

- Financial Solutions layout standard (MANDATORY)
- Benefits/Requirements page separation
- Exact element ordering for SEO
- Ad unit placement strategy

**Landing Page/Marketing Site?**

- Hero section with gradient headline
- Feature grid with icons
- Social proof section
- Conversion-focused CTAs

**Quiz/Recommender Tool?**

- Multi-step form pattern
- React Hook Form + Zod validation
- Progress indicator
- Dual storage (localStorage + cookies)

## 5. Configure Analytics

**Always Include:**

- Google Tag Manager (loads first)
- Google Ads conversion tracking
- UTM parameter capture

**Conditionally Include:**

- AdZep (auto-activation, never manual)
- TopAds (custom ad network)
- Brevo/ConvertKit (email marketing)

---

# Before You Start Coding

## Ask These Questions

1. **Who is the target user?**
   - US consumer seeking financial guidance?
   - UK user requiring FCA-compliant information?
   - Mexican market looking for tarjetas de crédito?
   - Gen-Z/Millennial seeking approachable financial advice?

2. **What is the primary user action?**
   - Compare credit cards and apply?
   - Read educational blog content?
   - Take a quiz to find personalized recommendations?
   - Subscribe to newsletter/email list?

3. **What should this feel like?**
   - Professional and authoritative (TopFinanzas)?
   - Warm and approachable (BudgetBee)?
   - Secure and trustworthy (KardTrust)?

4. **What is the content strategy?**
   - Static content (Astro)?
   - Dynamic content with API integrations (Next.js)?
   - Mixed content with MDX blog (Next.js + MDX)?

5. **What are the compliance requirements?**
   - FCA regulations (UK)?
   - CONDUSEF/PROFECO (Mexico)?
   - CCPA/CAN-SPAM (US)?

## Review Existing Implementations

Before building, review these successful examples in the workspace:

1. **topfinanzas-us-next** - US market Next.js implementation
2. **uk-topfinanzas-com** - UK market with FCA compliance
3. **budgetbee-next** - Unique brand identity, Gen-Z focus
4. **mejoresfinanzas** - Astro blog implementation, Spanish
5. **financial-blog-template** - Reusable template pattern
6. **emailgenius-broadcasts-generator** - Internal tool pattern

---

# Execution Checklist

When building a new TopNetworks website:

## Phase 1: Setup

- [ ] Create project directory with appropriate name
- [ ] Initialize git repository
- [ ] Choose framework (Next.js 15+ or Astro 5.0)
- [ ] Install dependencies with correct versions
- [ ] Configure TypeScript (strict mode)
- [ ] Set up Tailwind CSS with brand tokens
- [ ] Create environment files (.env.example, .env.local)

## Phase 2: Brand Integration

- [ ] Import Poppins font (or brand-specific font)
- [ ] Configure color palette (TopNetworks, BudgetBee, or KardTrust)
- [ ] Set up gradient utilities
- [ ] Add logo assets from Google Cloud Storage
- [ ] Configure favicon
- [ ] Create design tokens (spacing, typography, shadows)

## Phase 3: Core Structure

- [ ] Create directory structure (app/, components/, lib/)
- [ ] Set up root layout with analytics
- [ ] Configure metadata (SEO, Open Graph, Twitter)
- [ ] Implement navigation (header, footer)
- [ ] Create homepage with hero section
- [ ] Set up routing structure

## Phase 4: Analytics & Tracking

- [ ] Integrate Google Tag Manager
- [ ] Add Google Ads conversion tracking
- [ ] Configure AdZep (if applicable)
- [ ] Set up UTM parameter capture
- [ ] Implement TopAds (if applicable)
- [ ] Test analytics in development

## Phase 5: Content Implementation

- [ ] Create content pages (blog, product pages, etc.)
- [ ] Implement MDX support (if using blog)
- [ ] Configure content collections (Astro) or data structures (Next.js)
- [ ] Add search functionality (if applicable)
- [ ] Implement pagination
- [ ] Sync allPosts arrays (if using blog)

## Phase 6: Forms & Interactions

- [ ] Create contact form with Brevo integration
- [ ] Implement newsletter subscription
- [ ] Add multi-step forms (quiz/recommender) if applicable
- [ ] Configure form validation (Zod)
- [ ] Test form submissions
- [ ] Add success/error states

## Phase 7: Performance Optimization

- [ ] Configure image optimization (next/image, remote patterns)
- [ ] Set up build optimization (webpack config)
- [ ] Implement code splitting
- [ ] Add loading states
- [ ] Configure caching headers
- [ ] Test bundle size

## Phase 8: SEO Configuration

- [ ] Create sitemap (dynamic or static)
- [ ] Add robots.txt
- [ ] Configure canonical URLs
- [ ] Set up hreflang tags (multi-market)
- [ ] Add structured data (Organization schema)
- [ ] Test Open Graph tags

## Phase 9: Testing

- [ ] Run TypeScript type check
- [ ] Run ESLint
- [ ] Format code with Prettier
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Test accessibility (ARIA labels, keyboard navigation)
- [ ] Verify analytics tracking
- [ ] Test API endpoints
- [ ] Run Lighthouse audit

## Phase 10: Deployment

- [ ] Create ecosystem.config.js (PM2) or vercel.json
- [ ] Configure environment variables for production
- [ ] Set up git workflow script (if applicable)
- [ ] Create deployment documentation
- [ ] Deploy to staging/production
- [ ] Verify deployment
- [ ] Monitor PM2 logs (if applicable)

---

# Common Pitfalls to Avoid

## ❌ DO NOT:

1. **Use `console.log()` anywhere**
   - Always use `logger` from `@/lib/logger`

2. **Manually call `window.AdZepActivateAds()`**
   - AdZep auto-activates via `AdZepNavigationHandler`

3. **Deviate from Financial Solutions layout standard**
   - ANY deviation negatively impacts SEO and conversion rates

4. **Use generic AI design patterns**
   - Every TopNetworks site should reflect specific brand identity

5. **Skip market-specific localization**
   - US, UK, Mexico, LatAm have different requirements

6. **Forget to sync allPosts arrays**
   - Blog content must be updated across ALL listing pages

7. **Use Mexico domain as mx.topfinanzas.com**
   - Correct domain: topfinanzas.com/mx/

8. **Bypass git workflow scripts**
   - Always use automated scripts when available

9. **Use default port 3000**
   - Check port allocation (3004, 3020, 3040, 3070, 4322)

10. **Skip instruction files**
    - Always check `.github/instructions/` before implementing

## ✅ DO:

1. **Follow existing patterns**
   - Review successful implementations first

2. **Use brand-specific colors and typography**
   - TopNetworks tri-color gradient or BudgetBee golden yellow

3. **Implement proper analytics tracking**
   - GTM, Google Ads, AdZep, UTM parameters

4. **Optimize for performance**
   - next/image, code splitting, caching

5. **Test on all devices**
   - Mobile-first responsive design

6. **Document your work**
   - Update README, add comments, create documentation

7. **Follow market-specific compliance**
   - FCA (UK), CONDUSEF (Mexico), CCPA (US)

8. **Use TypeScript strictly**
   - No `any` types without justification

9. **Implement accessibility**
   - ARIA labels, keyboard navigation, high contrast

10. **Monitor deployment**
    - Check PM2 logs, verify analytics, test endpoints

---

# Success Metrics

A GeniusWeb-built website should achieve:

## Performance (Lighthouse)

- **Performance:** 90+ (95+ ideal)
- **Accessibility:** 95+
- **Best Practices:** 95+
- **SEO:** 100

## User Experience

- Mobile-first responsive design
- Fast page loads (< 3s)
- Smooth navigation
- Clear CTAs
- Intuitive forms

## SEO

- Proper metadata
- Structured data
- Sitemap
- Canonical URLs
- Hreflang tags (multi-market)

## Conversion

- Analytics tracking functional
- UTM parameters captured
- Forms submitting correctly
- Ad units displaying properly
- User journey optimized

## Brand Alignment

- Correct color palette
- Proper typography
- Logo usage
- Tone and messaging
- Market-specific terminology

---

# Resources & References

## Documentation

- **Workspace:** `/Users/macbookpro/GitHub/CLAUDE.MD`
- **Brand Identity:** `/Users/macbookpro/GitHub/emailgenius-broadcasts-generator/TOPNETWORKS_BRAND_IDENTITY.md`
- **BudgetBee:** `/Users/macbookpro/GitHub/budgetbee-next/BUDGETBEE_BRANDING.md`

## Example Repositories

- **topfinanzas-us-next:** `/Users/macbookpro/GitHub/topfinanzas-us-next/`
- **uk-topfinanzas-com:** `/Users/macbookpro/GitHub/uk-topfinanzas-com/`
- **budgetbee-next:** `/Users/macbookpro/GitHub/budgetbee-next/`
- **mejoresfinanzas:** `/Users/macbookpro/GitHub/mejoresfinanzas/`
- **financial-blog-template:** `/Users/macbookpro/GitHub/financial-blog-template/`
- **emailgenius-broadcasts-generator:** `/Users/macbookpro/GitHub/emailgenius-broadcasts-generator/`

## External Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Astro Docs:** https://docs.astro.build
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Shadcn/UI:** https://ui.shadcn.com
- **Radix UI:** https://www.radix-ui.com

---

# Final Note

GeniusWeb is not just a code generator. It's a system for creating TopNetworks-quality websites that:

1. **Follow proven patterns** from successful products
2. **Implement brand identity** consistently
3. **Optimize for performance** and conversions
4. **Respect market-specific** requirements
5. **Maintain code quality** standards

Every website you build should feel like it came from the same professional organization, while respecting the unique identity of each brand (TopFinanzas, BudgetBee, KardTrust).

When in doubt, reference existing implementations. When unsure, ask the user for clarification. When ready, build with confidence knowing you're following TopNetworks' proven success patterns.

---

**Skill Version:** 1.0
**Last Updated:** February 12, 2026
**Organization:** TopNetworks, Inc.
**Maintainer:** GeniusWeb Development Team
