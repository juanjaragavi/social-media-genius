---
name: brand-identity
description: Visual language, tone, typography, color systems, and asset usage across TopNetworks brands — TopFinanzas, KardTrust, and BudgetBee. Use when building any UI, writing copy, selecting imagery, or configuring design tokens for any TopNetworks property.
---

# Brand Identity — TopNetworks, Inc.

Apply this skill whenever producing code, copy, or design artifacts for any TopNetworks property. Brand compliance is non-negotiable: deviating from these standards negatively affects SEO, conversion rates, and brand trust across markets.

---

## Scope

**Use for:** UI components, page layouts, email templates, copy writing, image selection, color application, font loading, logo placement, and any output visible to end users across TopFinanzas (US/UK/MX), KardTrust, BudgetBee, MejoresFinanzas, and EmailGenius.

**Not for:** Internal tooling with no public-facing UI (use general Next.js patterns there).

---

## Brand Portfolio

| Brand           | Domain                | Market         | Audience                            |
| --------------- | --------------------- | -------------- | ----------------------------------- |
| TopFinanzas US  | us.topfinanzas.com    | United States  | US consumers, financial products    |
| TopFinanzas UK  | uk.topfinanzas.com    | United Kingdom | UK consumers, FCA-regulated content |
| TopFinanzas MX  | topfinanzas.com/mx/   | Mexico         | Mexican market, Spanish language    |
| MejoresFinanzas | mejoresfinanzas.com   | Latin America  | LatAm, Spanish-speaking             |
| BudgetBee       | budgetbeepro.com      | United States  | Gen-Z and Millennials               |
| KardTrust       | kardtrust.com         | Multi-market   | Credit card comparison              |
| EmailGenius     | email.topfinanzas.com | Internal       | Marketing operations team           |
| RouteGenius     | route.topnetworks.co  | Internal       | Traffic distribution tool           |

---

## Color Systems

### TopFinanzas / EmailGenius / RouteGenius

Primary brand palette using Tailwind CSS class names and hex values:

```css
/* Brand tokens — define in globals.css as @theme inline */
--color-brand-blue: #2563eb; /* blue-600 — primary actions, links */
--color-brand-cyan: #0891b2; /* cyan-600 — secondary accent */
--color-brand-lime: #84cc16; /* lime-500 — highlight accent */

/* Gradient backgrounds */
background: linear-gradient(to bottom right, #f0fdf4, #ecfeff, #dbeafe);
/* Tailwind: from-lime-50 via-cyan-50 to-blue-100 */
```

Usage rules:

- CTAs and primary buttons: `bg-blue-600 hover:bg-blue-700`
- Secondary buttons / tags: `bg-cyan-600 hover:bg-cyan-700`
- Highlight badges, progress bars: `bg-lime-500`
- Gradient hero backgrounds: `bg-gradient-to-br from-lime-50 via-cyan-50 to-blue-100`
- Text on white: `text-gray-800` (headings), `text-gray-700` (body), `text-gray-600` (secondary)

### BudgetBee

```css
--color-bee-gold: #e6b432; /* Primary — honey/bee theme */
--color-bee-black: #000000; /* Deep contrast */
--color-bee-white: #ffffff; /* Background */
--color-bee-teal: #3daaaa; /* Accent */
--color-bee-orange: #f4a261; /* Warm accent */
```

Usage rules:

- Hero sections and CTAs: gold (`#E6B432`) on black or white
- Navigation: black background with gold accents
- Cards: white with gold border or shadow
- Mascot (bee in hexagon): always placed in the top-left logo position

### KardTrust

KardTrust uses the same Tailwind utility approach as TopFinanzas. Default to the TopFinanzas blue/cyan/lime palette unless a KardTrust-specific design system is in place. Credit card imagery should be crisp, trust-signaling, and neutral in tone.

---

## Typography

### Primary Font: Poppins (All Properties)

```typescript
// Next.js font loading — app/layout.tsx
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Apply to <html>
<html className={`${poppins.variable} font-sans`}>
```

```css
/* tailwind.config */
fontFamily: {
  sans:
    [ "var(--font-poppins)",
    "system-ui",
    "sans-serif"];
}
```

Weight usage:

- 700 Bold: H1, hero headings
- 600 Semi-Bold: H2, section headings, CTAs
- 500 Medium: H3, card titles, navigation
- 400 Regular: Body text, descriptions
- 300 Light: Captions, secondary metadata

Never use external font requests at runtime. Always load via `next/font/google` with `display: "swap"`.

---

## Logo & Asset Usage

### Shared CDN Assets

```
TopNetworks Logo (positive, no background):
https://storage.googleapis.com/media-topfinanzas-com/images/topnetworks-positivo-sinfondo.webp

Global Favicon:
https://storage.googleapis.com/media-topfinanzas-com/favicon.png

Media CDN base (images, cards, hero shots):
https://storage.googleapis.com/media-topfinanzas-com/
```

Always reference CDN assets via `next/image` with explicit `width`, `height`, and descriptive `alt` text. Never inline SVG logos as strings; use `<Image>` or an SVG component.

### BudgetBee Mascot

The bee mascot lives in `/public/` as local assets. It is a friendly cartoon bee inside a hexagonal frame. Use it:

- In the header logo slot (always)
- In hero sections when the brand voice calls for warmth
- Never stretch, recolor, or modify the mascot proportions

---

## Tone of Voice

### TopFinanzas (US / UK / MX)

- **Voice:** Friendly-expert. Authoritative but approachable.
- **Perspective:** Educational, empowering. Never prescriptive.
- **Legal stance:** Always encourage readers to verify with official sources and qualified professionals.
- **Forbidden phrases:** "guaranteed," "you will," "best for everyone," "instant approval"
- **Required disclaimers:** Include `<AIContentDisclaimer />` on all AI-generated content pages.

### BudgetBee

- **Voice:** Casual, energetic, peer-to-peer. Think Gen-Z savvy friend who knows finance.
- **Tagline:** "Your Hive for Unbiased Financial Buzz"
- **Tone markers:** Conversational, uses "you" frequently, light humor acceptable, emoji optional in copy (never in code).
- **Content pillars:** Budgeting, saving, side hustles, student finance

### KardTrust

- **Voice:** Trustworthy, analytical, comparison-focused.
- **Emphasis:** Data accuracy, card features, side-by-side clarity.
- **Trust signals:** Use regulatory references (CFPB, FCA) and verified card data.

---

## Market-Specific Requirements

### United States (en-US)

- Currency: USD ($)
- Date format: MM/DD/YYYY
- Regulatory refs: CFPB, FTC, IRS, Federal Reserve, FDIC
- Compliance: CCPA, CAN-SPAM Act
- Domain: `us.topfinanzas.com`

### United Kingdom (en-GB)

- Currency: GBP (£)
- Date format: DD/MM/YYYY
- Regulatory refs: FCA, MAS, Citizens Advice
- Compliance: FCA regulations, GDPR
- Domain: `uk.topfinanzas.com`
- **Special:** FCA compliance language is mandatory on all financial product pages

### Mexico (es-MX)

- Currency: MXN ($)
- Date format: DD/MM/YYYY
- Regulatory refs: CONDUSEF, PROFECO
- Language: Spanish (Mexico variant)
- Domain: `topfinanzas.com/mx/` (NOT `mx.topfinanzas.com`)

### Latin America (es-US/es-LA)

- Language: Spanish (neutral LatAm variant, es-US locale code)
- Domain: `mejoresfinanzas.com`
- Target: Multi-country audience, avoid country-specific slang

---

## Image Standards

- Format: WebP (primary), PNG (fallback), JPG (email only)
- Hero images: minimum 800×450px, `priority={false}` with `loading="lazy"` unless above-the-fold
- All images must have descriptive `alt` text (not keyword-stuffed)
- CDN pattern: `https://storage.googleapis.com/media-topfinanzas-com/images/{market}/{filename}.webp`
- Never use placeholder or stock image URLs in production code

---

## Ad Placement Standards

All TopFinanzas content pages require these ad container `div`s with exact IDs:

```html
<!-- First ad unit — placed after H1, before first content section -->
<div id="square01" data-topads data-topads-size="square"></div>

<!-- Second ad unit — placed in final third of article -->
<div id="square02" data-topads data-topads-size="square"></div>
```

UK properties use AdZep unit IDs `uk_topfinanzas_3` and `uk_topfinanzas_4` (see `authentication` skill for AdZep details). Never call `window.AdZepActivateAds()` manually.

---

## Constraints

- **Never** use `console.log()` — always use the project's Pino logger (`import { logger } from "@/lib/logger"`)
- **Never** hard-code hex colors inline — use Tailwind classes or CSS variables
- **Never** modify font weights outside the 300–700 range
- **Never** use a different font family on any TopNetworks property
- **Never** remove or modify existing disclaimers
- **Never** promise guaranteed financial outcomes in any copy
