---
name: backend
description: API design, server-side logic, service architecture, and integration patterns with third-party services (ActiveCampaign, Brevo, ConvertKit, Supabase, Vertex AI) for TopNetworks properties. Use when building API routes, Server Actions, background jobs, or service integrations.
---

# Backend — TopNetworks, Inc.

This skill governs all server-side code across TopNetworks properties. Derived from route-genius (Supabase + Better Auth + Server Actions), emailgenius-broadcasts-generator (Vertex AI + PostgreSQL), topfinanzas-us-next (Brevo/SendGrid + GTM), and arbitrage-manager-dashboard (FastAPI + BigQuery).

---

## Scope

**Use for:** Next.js API routes, Server Actions, service integrations, email marketing APIs, AI generation pipelines, data fetching patterns, error handling, and rate limiting.

**Not for:** Database schema design (see `database` skill), authentication flows (see `authentication` skill), or frontend components (see `frontend` skill).

---

## Backend Stack by Project

| Project                          | Backend Stack                       | Key Integrations                                   |
| -------------------------------- | ----------------------------------- | -------------------------------------------------- |
| topfinanzas-us-next              | Next.js API Routes + Server Actions | Brevo (email), SendGrid, Google Ads                |
| uk-topfinanzas-com               | Next.js API Routes + Server Actions | Brevo, AdZep, FCA compliance                       |
| route-genius                     | Next.js Server Actions + Supabase   | Better Auth, GCS, Google Drive, Firebase           |
| emailgenius-broadcasts-generator | Next.js API Routes                  | Vertex AI Gemini 2.5 Flash, Imagen 4.0, PostgreSQL |
| arbitrage-manager-dashboard      | FastAPI (Python)                    | Meta Ads API, BigQuery, Cloud SQL                  |
| topAds-main                      | Express.js (Node.js)                | Ad network, Docker + Nginx                         |

---

## API Route Conventions (Next.js App Router)

```
app/api/
├── [feature]/
│   └── route.ts        # Handler file
```

### Route Handler Shape

```typescript
// app/api/generate-broadcast/route.ts
import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input at the boundary
    if (!body.platform || !body.market) {
      return NextResponse.json(
        { error: "Missing required fields: platform, market" },
        { status: 400 },
      );
    }

    const result = await processRequest(body);

    return NextResponse.json({ result }, { status: 200 });
  } catch (error) {
    logger.error({ error }, "API route failed");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  // ...
}
```

### HTTP Status Code Conventions

| Status | Meaning               | When to use                                 |
| ------ | --------------------- | ------------------------------------------- |
| 200    | OK                    | Successful GET, successful operation        |
| 201    | Created               | Successful POST that creates a resource     |
| 400    | Bad Request           | Validation failure, missing required fields |
| 401    | Unauthorized          | Not authenticated                           |
| 403    | Forbidden             | Authenticated but not authorized            |
| 404    | Not Found             | Resource doesn't exist                      |
| 409    | Conflict              | Duplicate resource                          |
| 410    | Gone                  | Resource existed but was disabled/deleted   |
| 429    | Too Many Requests     | Rate limit exceeded                         |
| 500    | Internal Server Error | Unhandled server error                      |

---

## Server Actions (route-genius Pattern)

Server Actions are the preferred mutation mechanism in App Router projects.

```typescript
// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { requireUserId } from "@/lib/auth-session";
import { createProject } from "@/lib/mock-data";
import { logger } from "@/lib/logger";

export async function createProjectAction(
  name: string,
  description: string,
): Promise<{ success: boolean; data?: Project; error?: string }> {
  const userId = await requireUserId(); // Always auth-check first

  try {
    const project = await createProject({ name, description }, userId);
    revalidatePath("/dashboard");
    return { success: true, data: project };
  } catch (error) {
    logger.error({ error, userId }, "Failed to create project");
    return { success: false, error: "Failed to create project" };
  }
}
```

**Server Action rules:**

- Always call `requireUserId()` or equivalent auth check as the first line
- Return `{ success: boolean, data?: T, error?: string }` shape
- Call `revalidatePath()` after mutations that affect cached pages
- Never expose internal error messages to the client — return generic messages, log specifics
- Use `"use server"` directive at the file top, not per-function

---

## Email Integration Patterns

### Brevo (Sendinblue) — Primary for US/UK TopFinanzas

```typescript
// lib/brevo.ts
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_BASE_URL = "https://api.brevo.com/v3";

export async function addContactToBrevo(
  email: string,
  attributes: Record<string, string | number>,
) {
  const response = await fetch(`${BREVO_BASE_URL}/contacts`, {
    method: "POST",
    headers: {
      "api-key": BREVO_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      attributes,
      listIds: [parseInt(process.env.BREVO_LIST_ID!)],
      updateEnabled: true,
    }),
  });

  if (!response.ok) {
    throw new Error(`Brevo API error: ${response.status}`);
  }

  return response.json();
}
```

Test scripts available in topfinanzas-us-next:

```bash
npm run test:brevo        # Test new contact integration
npm run test:brevo-direct # Direct Brevo API test
npm run test:brevo-api    # Full integration test
```

### ConvertKit — EmailGenius Integration

```typescript
const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
const CONVERTKIT_BASE = "https://api.convertkit.com/v3";

export async function subscribeToConvertKit(
  email: string,
  formId: string,
  tags: string[],
) {
  const response = await fetch(`${CONVERTKIT_BASE}/forms/${formId}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: CONVERTKIT_API_KEY, email, tags }),
  });
  return response.json();
}
```

### ActiveCampaign — Mexico / LatAm Markets

```typescript
const AC_BASE_URL = process.env.ACTIVECAMPAIGN_URL; // e.g. https://account.api-us1.com
const AC_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY;

export async function createActiveCampaignContact(
  email: string,
  firstName: string,
  listId: number,
) {
  const response = await fetch(`${AC_BASE_URL}/api/3/contacts`, {
    method: "POST",
    headers: {
      "Api-Token": AC_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      contact: { email, firstName },
    }),
  });
  const { contact } = await response.json();

  // Subscribe to list
  await fetch(`${AC_BASE_URL}/api/3/contactLists`, {
    method: "POST",
    headers: { "Api-Token": AC_API_KEY!, "Content-Type": "application/json" },
    body: JSON.stringify({
      contactList: { list: listId, contact: contact.id, status: 1 },
    }),
  });
}
```

---

## AI Integration Patterns (Vertex AI — EmailGenius)

```typescript
// lib/vertex-ai.ts
import { VertexAI } from "@google-cloud/vertexai";

const vertex = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT!,
  location: "us-central1",
});

const generativeModel = vertex.getGenerativeModel({
  model: "gemini-2.5-flash", // Gemini 2.5 Flash for text
});

export async function generateEmailBroadcast(prompt: string): Promise<string> {
  const request = {
    contents: [{ role: "user" as const, parts: [{ text: prompt }] }],
  };

  const result = await generativeModel.generateContent(request);
  return result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

// Image generation — Vertex AI Imagen 4.0
const imageModel = vertex.getGenerativeModel({
  model: "imagen-4.0-generate-preview-06-06",
});
```

Authentication uses Application Default Credentials (ADC) with service account fallback:

```typescript
// Authentication priority: GOOGLE_APPLICATION_CREDENTIALS env var → ADC
// Service account JSON stored in credentials/ directory (gitignored)
```

---

## Rate Limiting (route-genius Pattern)

```typescript
// lib/rate-limit.ts — Supabase PG function approach
export async function checkRateLimit(
  key: string,
  windowSeconds = 10,
  maxRequests = 100,
): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_key: key,
    p_window_seconds: windowSeconds,
    p_max_requests: maxRequests,
  });

  if (error) {
    logger.warn({ error, key }, "Rate limit check failed — failing open");
    return true; // Fail open: allow through on DB errors
  }

  return data as boolean;
}

// In redirect route:
const allowed = await checkRateLimit(`redirect:${clientIp}`);
if (!allowed) {
  return new Response("Too Many Requests", { status: 429 });
}
```

**Rate limit configuration:**

- Redirect endpoint: 100 requests / 10 seconds per IP
- Default failure mode: **fail open** (allow through on DB errors)
- Development bypass: `DISABLE_RATE_LIMITING=true` env variable

---

## Error Handling Standards

```typescript
// GCP Error Reporting — server-side (route-genius)
import { ErrorReporting } from "@google-cloud/error-reporting";
const errors = new ErrorReporting({ projectId: process.env.GCS_PROJECT_ID });

try {
  // operation
} catch (error) {
  errors.report(error as Error);
  logger.error({ error }, "Operation failed");
  throw error; // Re-throw in Server Actions; return error response in API routes
}
```

Error response shape (always return JSON from API routes):

```typescript
// Success
{ success: true, data: T }
// or
{ result: T }

// Error
{ error: "Human-readable message" }
{ success: false, error: "Human-readable message" }
```

Never expose stack traces, SQL errors, or internal implementation details in error responses.

---

## Middleware (proxy.ts — route-genius / Next.js 16)

Next.js 16 renamed middleware from `middleware.ts` to `proxy.ts`. Both versions are used across the workspace:

```typescript
// proxy.ts (Next.js 16 — route-genius)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes — no auth required
  const publicPaths = [
    "/api/redirect",
    "/api/auth",
    "/api/analytics",
    "/analytics",
    "/login",
  ];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check session cookie — supports both HTTP and HTTPS prefixes
  const sessionCookie =
    request.cookies.get("__Secure-better-auth.session_token") ||
    request.cookies.get("better-auth.session_token");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}
```

---

## Third-Party API Patterns

### Google Cloud Storage (Avatar uploads)

```typescript
// lib/storage/gcs.ts
import { Storage } from "@google-cloud/storage";

const storage = new Storage({
  projectId: process.env.GCS_PROJECT_ID,
  credentials: {
    client_email: process.env.GCS_CLIENT_EMAIL,
    private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
});

const bucket = storage.bucket(
  process.env.GCS_BUCKET_NAME ?? "routegenius-media-development",
);

export async function uploadAvatar(
  buffer: Buffer,
  filename: string,
): Promise<string> {
  const file = bucket.file(`avatars/${filename}`);
  await file.save(buffer, { contentType: "image/png", public: true });
  return `https://storage.googleapis.com/${bucket.name}/avatars/${filename}`;
}
```

### Google Drive API (Backup/Restore)

```typescript
// lib/google-drive.ts
import { google } from "googleapis";

export function getDriveClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ access_token: accessToken });
  return google.drive({ version: "v3", auth: oauth2Client });
}
```

---

## Meta Ads API (arbitrage-manager-dashboard)

The arbitrage dashboard uses Python FastAPI with the Meta Ads SDK:

```python
# Python / FastAPI pattern
from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount

FacebookAdsApi.init(access_token=META_ACCESS_TOKEN)

def get_campaign_insights(account_id: str, date_range: dict):
    account = AdAccount(f"act_{account_id}")
    return account.get_insights(fields=["campaign_name", "spend", "roas"], params=date_range)
```

---

## Logging

**NEVER use `console.log()`, `console.warn()`, or `console.error()`.**

```typescript
import { logger } from "@/lib/logger";

// Structured logging with context
logger.info({ userId, projectId }, "Project created");
logger.warn({ rateLimitKey, ip }, "Rate limit approaching");
logger.error({ error, endpoint }, "API call failed");
logger.debug({ body }, "Request received"); // Only visible with NEXT_PUBLIC_ENABLE_LOGGING=true
```

---

## Environment Variable Conventions

All environment variables follow these naming conventions:

- `NEXT_PUBLIC_*` — Exposed to the browser (public, non-sensitive only)
- No prefix — Server-only (never exposed to client)
- Sensitive values (API keys, private keys) never have `NEXT_PUBLIC_` prefix

Key patterns:

```bash
# Google Cloud — service account credentials
GOOGLE_CLOUD_PROJECT=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=           # PEM format — replace \n with actual newlines when loading

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=    # Server-only — bypasses RLS

# Email APIs
BREVO_API_KEY=
CONVERTKIT_API_KEY=
ACTIVECAMPAIGN_API_KEY=
ACTIVECAMPAIGN_URL=

# Database
DATABASE_URL=                 # PostgreSQL connection string
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
```

---

## Constraints

- All user input must be validated at system boundaries (API routes, Server Actions) — never trust client-supplied data
- Never log PII (email addresses, names, IP addresses beyond rate limiting) in structured logs
- Never expose internal error details (stack traces, SQL) to clients
- Never create multiple Supabase client instances — use singleton pattern
- Supabase service role key (`SUPABASE_SERVICE_ROLE_KEY`) bypasses RLS — use only on server, never expose to client
- All monetary values stored as integers (cents/pence) — never floats
- `Math.random()` is acceptable for probabilistic routing (route-genius rotation algorithm) but not for cryptographic purposes
- Use `crypto.randomUUID()` for all ID generation — never `Date.now()` or sequential IDs
