---
name: gcp-nextjs-bootstrap
description: GCP service configuration and full-stack Next.js bootstrapping workflow for TopNetworks properties. Generates browser agent instruction sets for GCP project setup, OAuth, Supabase, Cloud Storage, and Firebase provisioning, then enforces a hard wait state before any backend code is written. Use when creating a new full-stack Next.js application, adding backend services to an existing frontend, or refactoring/upgrading an existing full-stack Next.js codebase.
---

# GCP & Full-Stack Next.js Bootstrap — TopNetworks, Inc.

---

## Scope

**Use for:**

- Creating a new full-stack Next.js application from scratch inside `/Users/MacBookPro/GitHub`
- Adding backend services (API routes, server actions, database, auth, storage) to an existing Next.js frontend
- Refactoring or upgrading an existing full-stack Next.js application to align with RouteGenius conventions

**Not for:**

- Frontend-only changes (styling, components, layout) with no backend services
- Projects outside `/Users/MacBookPro/GitHub`
- Non-Next.js frameworks (Astro, Express, FastAPI)

---

## Canonical Reference

All architectural decisions, naming conventions, environment variable keys, and integration patterns **must** mirror `/Users/MacBookPro/GitHub/route-genius`. Read that repository before writing any code for a new project.

**Key reference files:**

- `/Users/MacBookPro/GitHub/route-genius/.env.example` — Authoritative env var naming
- `/Users/MacBookPro/GitHub/route-genius/lib/` — Integration patterns (auth, db, storage, gcp)
- `/Users/MacBookPro/GitHub/route-genius/app/api/` — API route structure
- `/Users/MacBookPro/GitHub/route-genius/app/actions.ts` — Server Action patterns
- `/Users/MacBookPro/GitHub/route-genius/proxy.ts` — Middleware (Next.js 16 pattern)
- `/Users/MacBookPro/GitHub/route-genius/scripts/*.sql` — Migration file conventions

---

## Trigger Conditions

Invoke this skill when the user's request matches **any** of:

1. "Create a new full-stack Next.js app / project / tool"
2. "Add a database / backend / auth / API routes / server actions" to an existing Next.js frontend
3. "Upgrade / refactor / migrate" an existing Next.js app to use GCP services, Supabase, Better Auth, or Firebase
4. Any request that implies persistent server-side state (user accounts, data storage, file uploads, background jobs)

**Do not invoke** for purely frontend work: adding pages, components, styling, or static content to an existing full-stack app that already has environment variables configured.

---

## Execution Sequence

```
1. READ workspace context
2. CLASSIFY request against trigger conditions
3. IF backend services required:
     a. GENERATE browser agent instruction set (see section below)
     b. ENTER wait state — no backend code written
     c. COMMUNICATE wait state to user
4. RECEIVE environment variables from user
5. SCAFFOLD / REFACTOR application
6. INJECT env vars into .env.local
7. WIRE integrations following RouteGenius conventions
8. CONFIRM structure to user with cd path
```

---

## Step 3a — Browser Agent Instruction Set

When backend services are required, generate the following instruction set verbatim for the browser-controlling agent. Customize the `[PROJECT_NAME]`, `[PORT]`, and `[DOMAIN]` placeholders based on the user's request before handing off.

---

### BROWSER AGENT INSTRUCTIONS — GCP & Service Configuration

**Target project:** `[PROJECT_NAME]`
**Development port:** `[PORT]`
**Production domain:** `[DOMAIN]`

You are a browser-controlling agent. Execute the following steps in order. After completing all steps, compile every environment variable key-value pair and return them to the coding agent. Do not skip any step. Confirm each step is complete before proceeding to the next.

---

#### PHASE 1 — Google Cloud Project

**Step 1.1 — Create or Select GCP Project**

1. Navigate to `https://console.cloud.google.com/`
2. In the top project picker, click "New Project" (or select an existing project if the user has specified one)
3. Set project name: `[PROJECT_NAME]`
4. Note the auto-generated **Project ID** (e.g., `project-name-123456`) — this is `GCS_PROJECT_ID`
5. Click "Create" and wait for the project to be provisioned

**Step 1.2 — Enable Required APIs**

1. Navigate to `https://console.cloud.google.com/apis/library`
2. Enable the following APIs one by one (search each name, click "Enable"):
   - **Cloud Storage API** (`storage.googleapis.com`)
   - **Cloud Error Reporting API** (`clouderrorreporting.googleapis.com`)
   - **Google Drive API** (`drive.googleapis.com`)
   - **Google Picker API** (`picker.googleapis.com`)
   - **Identity and Access Management (IAM) API** (`iam.googleapis.com`)
3. Confirm each API shows "API enabled" before proceeding

---

#### PHASE 2 — OAuth Consent Screen & Google OAuth Credentials

**Step 2.1 — Configure OAuth Consent Screen**

1. Navigate to `https://console.cloud.google.com/apis/credentials/consent`
2. Select "External" user type → Click "Create"
3. Fill in:
   - App name: `[PROJECT_NAME]`
   - User support email: `info@topnetworks.co`
   - Developer contact email: `info@topnetworks.co`
4. On "Scopes" screen: add `email`, `profile`, `openid`
5. On "Test users" screen: add `info@topnetworks.co` and any additional developer emails
6. Click "Save and Continue" through all steps until published (or left in Testing for dev)

**Step 2.2 — Create OAuth 2.0 Client ID**

1. Navigate to `https://console.cloud.google.com/apis/credentials`
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: `[PROJECT_NAME] Web Client`
5. Authorized JavaScript origins — add all of:
   - `http://localhost:[PORT]`
   - `https://[DOMAIN]` (if known)
6. Authorized redirect URIs — add all of:
   - `http://localhost:[PORT]/api/auth/callback/google`
   - `https://[DOMAIN]/api/auth/callback/google` (if known)
   - `http://localhost:[PORT]/api/auth/google-drive/callback`
   - `https://[DOMAIN]/api/auth/google-drive/callback` (if known)
7. Click "Create"
8. Copy and record:
   - `GOOGLE_CLIENT_ID` = Client ID shown
   - `GOOGLE_CLIENT_SECRET` = Client Secret shown
   - (These are also used as `GOOGLE_DRIVE_CLIENT_ID` and `GOOGLE_DRIVE_CLIENT_SECRET`)

**Step 2.3 — Create Picker-Restricted API Key**

1. On the Credentials page, click "Create Credentials" → "API Key"
2. Name it: `[PROJECT_NAME] Picker Key`
3. Click "Restrict Key":
   - Under "API restrictions": select "Restrict key" → choose "Google Picker API"
   - Under "Website restrictions": add referrers:
     - `localhost:[PORT]/*`
     - `[DOMAIN]/*` (if known)
4. Click "Save"
5. Copy and record:
   - `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY` = API key value
   - `NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID` = same value as `GOOGLE_CLIENT_ID`
   - `NEXT_PUBLIC_GOOGLE_PICKER_APP_ID` = GCP project number (visible in project dashboard under "Project number")

---

#### PHASE 3 — Cloud Storage (GCS)

**Step 3.1 — Create Storage Bucket**

1. Navigate to `https://console.cloud.google.com/storage/browser`
2. Click "Create Bucket"
3. Name: `[project-name]-media-development` (lowercase, hyphens)
4. Location type: **Region** → `us-central1`
5. Storage class: **Standard**
6. Access control: **Uniform**
7. Public access: **Allow public access** (for media serving)
8. Click "Create"
9. Record:
   - `GCS_BUCKET_NAME` = bucket name set above

**Step 3.2 — Create GCS Service Account**

1. Navigate to `https://console.cloud.google.com/iam-admin/serviceaccounts`
2. Click "Create Service Account"
3. Name: `[project-name]-gcs-sa`
4. Description: `GCS service account for [PROJECT_NAME]`
5. Click "Create and Continue"
6. Grant roles:
   - `Storage Admin` (for the specific bucket)
   - `Error Reporting Writer`
7. Click "Done"

**Step 3.3 — Generate Service Account Key**

1. Click on the newly created service account
2. Go to "Keys" tab → "Add Key" → "Create new key" → JSON
3. Download the JSON file
4. Open the JSON file and extract:
   - `GCS_PROJECT_ID` = `project_id` field
   - `GCS_CLIENT_EMAIL` = `client_email` field
   - `GCS_PRIVATE_KEY` = `private_key` field (the full multi-line PEM string — keep `\n` escapes as literal `\n` characters when pasting into `.env.local`)
5. Save the JSON file to `credentials/gcs-service-account.json` inside the project directory
6. Record:
   - `GOOGLE_APPLICATION_CREDENTIALS` = `credentials/gcs-service-account.json`

---

#### PHASE 4 — Supabase (PostgreSQL Database + Auth tables)

**Step 4.1 — Create Supabase Project**

1. Navigate to `https://supabase.com/dashboard`
2. Click "New Project"
3. Organization: TopNetworks (or create if absent)
4. Project name: `[project-name]`
5. Database password: generate a strong password and record it securely
6. Region: `us-west-2` (Oregon) — matches existing TopNetworks projects
7. Plan: Free (or Pro if production)
8. Click "Create new project" and wait for provisioning (~2 minutes)

**Step 4.2 — Collect Supabase Credentials**

1. Navigate to: Project Settings → API
2. Record:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL (e.g., `https://abcdefgh.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `anon` / `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` = `service_role` key (secret — never expose client-side)
3. Navigate to: Project Settings → Database → Connection string → URI (with pooling: `Session mode`, port `6543`)
4. Record:
   - `DATABASE_URL` = the full connection string (replace `[YOUR-PASSWORD]` with the password set in Step 4.1)

**Step 4.3 — Run Better Auth Migrations**

1. In Supabase dashboard, navigate to: SQL Editor
2. Run the Better Auth schema migration by pasting and executing the SQL from:
   `https://www.better-auth.com/docs/concepts/database#schema` (session, account, verification tables)
3. Confirm tables `user`, `session`, `account`, `verification` are created under the `public` schema

---

#### PHASE 5 — Firebase (Analytics + Crashlytics)

**Step 5.1 — Create Firebase Project**

1. Navigate to `https://console.firebase.google.com/`
2. Click "Add project"
3. Select the GCP project created in Phase 1 (to link them)
4. Enable Google Analytics when prompted → link to a Google Analytics account (or create `[PROJECT_NAME] Analytics`)
5. Click "Create project"

**Step 5.2 — Register Web App**

1. In Firebase console → Project Overview → click "</>" (Web)
2. App nickname: `[PROJECT_NAME] Web`
3. Do NOT check "Firebase Hosting"
4. Click "Register app"
5. From the `firebaseConfig` object shown, record:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

**Step 5.3 — Enable Crashlytics**

1. In Firebase console → Release & Monitor → Crashlytics
2. Click "Enable Crashlytics"
3. Follow setup prompts (no additional env vars needed — uses `NEXT_PUBLIC_FIREBASE_APP_ID`)

---

#### PHASE 6 — Google Analytics 4

**Step 6.1 — Collect GA4 Measurement ID**

1. Navigate to `https://analytics.google.com/`
2. Open the property linked in Step 5.1 (or create a new GA4 property for `[DOMAIN]`)
3. Go to: Admin → Data Streams → select the web stream
4. Record:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID` = Measurement ID (format: `G-XXXXXXXXXX`)

---

#### PHASE 7 — Final Environment Variable Compilation

Compile all recorded values into the following `.env.local` template and return the completed block to the coding agent:

```env
# ============================================================
# APP — [PROJECT_NAME]
# ============================================================
NEXT_PUBLIC_APP_URL=http://localhost:[PORT]
NODE_ENV=development
NEXT_PUBLIC_ENABLE_LOGGING=true

# ============================================================
# SUPABASE (PostgreSQL)
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# ============================================================
# BETTER AUTH
# ============================================================
BETTER_AUTH_SECRET=                          # Run: openssl rand -base64 32
BETTER_AUTH_URL=http://localhost:[PORT]

# ============================================================
# GOOGLE OAUTH
# ============================================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# ============================================================
# GOOGLE ANALYTICS 4
# ============================================================
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# ============================================================
# FIREBASE (Crashlytics + Analytics)
# ============================================================
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ============================================================
# GOOGLE CLOUD STORAGE (Avatars / Media)
# ============================================================
GCS_BUCKET_NAME=
GCS_PROJECT_ID=
GCS_CLIENT_EMAIL=
GCS_PRIVATE_KEY=
GOOGLE_APPLICATION_CREDENTIALS=credentials/gcs-service-account.json

# ============================================================
# GOOGLE DRIVE (Backup / Restore)
# ============================================================
GOOGLE_DRIVE_CLIENT_ID=                      # Same as GOOGLE_CLIENT_ID
GOOGLE_DRIVE_CLIENT_SECRET=                  # Same as GOOGLE_CLIENT_SECRET
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:[PORT]/api/auth/google-drive/callback

# ============================================================
# GOOGLE PICKER API
# ============================================================
NEXT_PUBLIC_GOOGLE_PICKER_API_KEY=
NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID=          # Same as GOOGLE_CLIENT_ID
NEXT_PUBLIC_GOOGLE_PICKER_APP_ID=            # GCP project number

# ============================================================
# FEATURE FLAGS (Development)
# ============================================================
SKIP_URL_VALIDATION=true
DISABLE_RATE_LIMITING=true
```

**Return the completed `.env.local` block to the coding agent to unblock scaffold.**

---

_(End of browser agent instruction set)_

---

## Step 3b — Wait State

After handing off the browser agent instruction set, the coding agent **must**:

1. Output the following message to the user:

   > "I've generated the GCP configuration instructions for the browser agent. Once the browser agent completes all phases and returns the populated `.env.local` block, paste it here and I'll proceed with scaffolding `[PROJECT_NAME]`."

2. **Stop all code generation.** Do not scaffold directories, generate files, configure integrations, or write any TypeScript/SQL until the user pastes the environment variables.

3. **Exception:** The coding agent MAY create the project directory, `package.json`, and `README.md` (frontend shell only) while waiting, but must not write any file that imports or references environment variables.

---

## Step 5 — Scaffold / Refactor Following RouteGenius Conventions

Once environment variables are received, scaffold the application using the following structure as the baseline. Adapt to project-specific requirements.

### Directory Structure

```
[project-name]/
├── app/
│   ├── layout.tsx              # Root layout with GTM, GA, fonts
│   ├── page.tsx                # Landing / home
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx            # Google OAuth sign-in page
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...all]/
│   │   │       └── route.ts    # Better Auth catch-all
│   │   └── profile/
│   │       └── avatar/
│   │           └── route.ts    # GCS avatar upload
│   └── actions.ts              # Server Actions
├── components/
│   └── DashboardNav.tsx
├── lib/
│   ├── auth.ts                 # Better Auth config
│   ├── auth-client.ts          # Client-side auth helpers
│   ├── auth-session.ts         # Server-side session helper
│   ├── db.ts                   # Supabase client + CRUD functions
│   ├── storage/
│   │   └── gcs.ts              # Google Cloud Storage helpers
│   ├── gcp/
│   │   └── error-reporting.ts  # GCP Error Reporting
│   ├── firebase/
│   │   ├── config.ts           # Firebase initialization
│   │   └── crashlytics.ts      # Error logging helpers
│   ├── google-drive.ts         # Drive API (backup/restore)
│   ├── rate-limit.ts           # Supabase sliding-window rate limiter
│   ├── types.ts                # Shared TypeScript types
│   └── logger.ts               # Pino logger (never console.log)
├── scripts/
│   └── 001-create-initial-tables.sql
├── credentials/
│   └── .gitkeep                # gcs-service-account.json goes here (gitignored)
├── proxy.ts                    # Route protection (Next.js 16 middleware)
├── next.config.ts
├── package.json
├── tsconfig.json
├── .env.example                # Template with all keys, empty values
├── .env.local                  # Populated from browser agent output (gitignored)
└── .gitignore
```

### Package Dependencies (baseline from RouteGenius)

```json
{
  "dependencies": {
    "@google-cloud/error-reporting": "^3.0.5",
    "@google-cloud/storage": "^7.19.0",
    "@next/third-parties": "^16.1.6",
    "@supabase/supabase-js": "^2.95.3",
    "better-auth": "^1.4.18",
    "firebase": "^12.9.0",
    "framer-motion": "^12.34.0",
    "lucide-react": "^0.563.0",
    "next": "16.1.6",
    "pg": "^8.18.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "uuid": "^13.0.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "@types/node": "^20",
    "@types/pg": "^8.16.0",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/uuid": "^10.0.0",
    "eslint": "^9",
    "prettier": "^3.8.1",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
```

Remove dependencies that are not needed for the specific project (e.g., `react-easy-crop`, `recharts` are optional). Do not add dependencies not in this baseline without explicit user instruction.

---

## Step 6 — Environment Variable Injection

Write the user-provided values directly into `.env.local`. Generate `.env.example` with all keys present but values empty (safe to commit).

**Critical rules:**

- `GCS_PRIVATE_KEY` — the multi-line PEM key must have literal `\n` characters (not actual newlines) when written to `.env.local`
- `GOOGLE_APPLICATION_CREDENTIALS` — must be a relative path from project root: `credentials/gcs-service-account.json`
- Add `credentials/gcs-service-account.json` and `.env.local` to `.gitignore`
- Never commit actual key values

---

## Step 7 — Integration Wiring (RouteGenius Patterns)

### Supabase Client (`lib/db.ts`)

```typescript
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}
```

### Better Auth (`lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:[PORT]";

export const auth = betterAuth({
  baseURL,
  trustedOrigins: ["http://localhost:[PORT]", "https://[DOMAIN]"],
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  emailAndPassword: { enabled: false },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      redirectURI: `${baseURL}/api/auth/callback/google`,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
});
```

### Logging (never `console.log`)

```typescript
// lib/logger.ts
import pino from "pino";

export const logger = pino({
  level: process.env.NEXT_PUBLIC_ENABLE_LOGGING === "true" ? "debug" : "silent",
});
```

Use: `logger.info({...context}, "message")` — never `console.log()`, `console.warn()`, or `console.error()`.

### Route Protection (`proxy.ts`)

```typescript
// Next.js 16: middleware is exported as proxy(), not middleware()
export function proxy() { ... }
```

Mirror the pattern from `/Users/MacBookPro/GitHub/route-genius/proxy.ts` exactly.

---

## Critical Constraints

1. **No backend code before env vars** — Enforced without exception
2. **No `console.log()`** — Use `logger` from `lib/logger.ts`
3. **No `any` TypeScript types** without explicit justification
4. **No direct Supabase queries** — All DB access via functions in `lib/db.ts`
5. **No inline credentials** — All secrets via `process.env`
6. **Gitignore** must include: `.env.local`, `credentials/*.json`, `.next/`, `node_modules/`
7. **Port assignment** — Check `CLAUDE.md` port registry before assigning; do not conflict with:
   - 3004 (uk-topfinanzas-com), 3020 (emailgenius), 3040 (topfinanzas-us-next), 3070 (route-genius), 4322 (mejoresfinanzas)
8. **Project location** — All new projects created directly in `/Users/MacBookPro/GitHub/[project-name]`
