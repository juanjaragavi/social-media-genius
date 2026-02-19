# Browser Agent Prompt — Vercel Environment Variable Provisioning

You are a browser automation agent. Execute the following instructions **exactly and in order**. Do not skip steps or improvise. Each step specifies a precise action in the Vercel dashboard.

---

## Context

**Project**: Social Media Genius
**Dashboard URL**: `https://vercel.com/juan-jaramillo/social-media-genius/settings/environment-variables`
**Account**: juan-jaramillo (TopNetworks)

**Environment topology**:

| Vercel Environment | Git Branch | Canonical URL                            |
| ------------------ | ---------- | ---------------------------------------- |
| Production         | `main`     | `https://social.topnetworks.co`          |
| Preview            | `staging`  | `https://social-media-genius.vercel.app` |
| Development        | `dev`      | `http://localhost:3050`                  |

---

## STEP 1 — Navigate

1. Open the URL: `https://vercel.com/juan-jaramillo/social-media-genius/settings/environment-variables`
2. Wait for the page to fully load. You should see a table of existing environment variables.

---

## STEP 2 — Delete stale entries that must be split per-environment

For each variable listed below, locate the row where the **Environments** column shows the scope indicated. Click the **three-dot menu (⋮)** on that row → click **Remove** → confirm deletion.

**Delete these exact rows:**

| #   | Variable Name                | Current Scope to DELETE          |
| --- | ---------------------------- | -------------------------------- |
| 1   | `NODE_ENV`                   | Development, Preview, Production |
| 2   | `DISABLE_RATE_LIMITING`      | Development, Preview, Production |
| 3   | `NEXT_PUBLIC_ENABLE_LOGGING` | Development, Preview, Production |
| 4   | `SKIP_URL_VALIDATION`        | Development, Preview, Production |
| 5   | `PORT`                       | Production, Preview, Development |

**IMPORTANT**: Do NOT delete any other rows. Specifically, do NOT delete:

- `BETTER_AUTH_URL` scoped to Development (keep it)
- `NEXT_PUBLIC_APP_URL` scoped to Development (keep it)
- `GOOGLE_DRIVE_REDIRECT_URI` scoped to Development (keep it)

---

## STEP 3 — Add Production-only variables

For each entry below:

1. Click the **"Add New"** button
2. Enter the **Key** (variable name) in the key field
3. Enter the **Value** exactly as shown
4. Under **Environments**, **uncheck** all boxes, then check **only "Production"**
5. Click **Save**

Repeat for all 7 entries:

| #   | Key                          | Value                                                          |
| --- | ---------------------------- | -------------------------------------------------------------- |
| 1   | `BETTER_AUTH_URL`            | `https://social.topnetworks.co`                                |
| 2   | `NEXT_PUBLIC_APP_URL`        | `https://social.topnetworks.co`                                |
| 3   | `GOOGLE_DRIVE_REDIRECT_URI`  | `https://social.topnetworks.co/api/auth/google-drive/callback` |
| 4   | `NODE_ENV`                   | `production`                                                   |
| 5   | `DISABLE_RATE_LIMITING`      | `false`                                                        |
| 6   | `NEXT_PUBLIC_ENABLE_LOGGING` | `false`                                                        |
| 7   | `SKIP_URL_VALIDATION`        | `false`                                                        |

Total: 7 new Production-only entries.

---

## STEP 4 — Add Preview-only variables

For each entry below:

1. Click the **"Add New"** button
2. Enter the **Key** and **Value** exactly as shown
3. Under **Environments**, **uncheck** all boxes, then check **only "Preview"**
4. Click **Save**

Repeat for all 7 entries:

| #   | Key                          | Value                                                                   |
| --- | ---------------------------- | ----------------------------------------------------------------------- |
| 1   | `BETTER_AUTH_URL`            | `https://social-media-genius.vercel.app`                                |
| 2   | `NEXT_PUBLIC_APP_URL`        | `https://social-media-genius.vercel.app`                                |
| 3   | `GOOGLE_DRIVE_REDIRECT_URI`  | `https://social-media-genius.vercel.app/api/auth/google-drive/callback` |
| 4   | `NODE_ENV`                   | `production`                                                            |
| 5   | `DISABLE_RATE_LIMITING`      | `true`                                                                  |
| 6   | `NEXT_PUBLIC_ENABLE_LOGGING` | `true`                                                                  |
| 7   | `SKIP_URL_VALIDATION`        | `true`                                                                  |

Total: 7 new Preview-only entries.

---

## STEP 5 — Add Development-only variables

For each entry below:

1. Click the **"Add New"** button
2. Enter the **Key** and **Value** exactly as shown
3. Under **Environments**, **uncheck** all boxes, then check **only "Development"**
4. Click **Save**

**Note**: `BETTER_AUTH_URL`, `NEXT_PUBLIC_APP_URL`, and `GOOGLE_DRIVE_REDIRECT_URI` already have correct Development-only entries. Do NOT recreate them.

| #   | Key                          | Value         |
| --- | ---------------------------- | ------------- |
| 1   | `NODE_ENV`                   | `development` |
| 2   | `PORT`                       | `3050`        |
| 3   | `DISABLE_RATE_LIMITING`      | `true`        |
| 4   | `NEXT_PUBLIC_ENABLE_LOGGING` | `true`        |
| 5   | `SKIP_URL_VALIDATION`        | `true`        |

Total: 5 new Development-only entries.

---

## STEP 6 — Verify existing entries (read-only, no changes)

Scroll through the variable list and **confirm** each row below exists with the correct scope. If any is missing or scoped incorrectly, report it but do NOT modify it.

### 6A — Development-only entries (should already exist)

| Variable                    | Value                                                  | Scope       |
| --------------------------- | ------------------------------------------------------ | ----------- |
| `BETTER_AUTH_URL`           | `http://localhost:3050`                                | Development |
| `NEXT_PUBLIC_APP_URL`       | `http://localhost:3050`                                | Development |
| `GOOGLE_DRIVE_REDIRECT_URI` | `http://localhost:3050/api/auth/google-drive/callback` | Development |

### 6B — Shared entries (all three environments)

Confirm each of these variables is scoped to **Development, Preview, Production**:

- `BETTER_AUTH_SECRET`
- `GOOGLE_OAUTH_CLIENT_ID`
- `GOOGLE_OAUTH_CLIENT_SECRET`
- `GOOGLE_CLOUD_PROJECT`
- `GOOGLE_CLOUD_LOCATION`
- `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- `GOOGLE_PRIVATE_KEY`
- `GCS_BUCKET_NAME`
- `GCS_CLIENT_EMAIL`
- `GCS_PROJECT_ID`
- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_FOLDER_ID`
- `NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY`
- `NEXT_PUBLIC_GOOGLE_PICKER_APP_ID`
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `DATABASE_URL`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_CONNECTION_NAME`
- `NEXT_PUBLIC_APP_NAME`

---

## STEP 7 — Configure Google Cloud OAuth Clients

This project uses **two** OAuth 2.0 Client IDs. Both need redirect URIs for all three environments.

### 7A — Navigate to GCP Credentials

Open: `https://console.cloud.google.com/apis/credentials?project=absolute-brook-452020-d5`

Wait for the page to load. You should see the **OAuth 2.0 Client IDs** section.

### 7B — Better Auth OAuth Client (Google Sign-In)

Locate the client with ID: `145904061405-jvsjilhdcv2647grr6b0pl70qh8mv0mq.apps.googleusercontent.com`

Click **Edit** (pencil icon). Then:

**Authorized JavaScript origins** — add all of these (skip any that already exist):

```bash
http://localhost:3050
https://social-media-genius.vercel.app
https://social.topnetworks.co
```

**Authorized redirect URIs** — add all of these (skip any that already exist):

```bash
http://localhost:3050/api/auth/callback/google
https://social-media-genius.vercel.app/api/auth/callback/google
https://social.topnetworks.co/api/auth/callback/google
```

Click **Save**.

### 7C — Google Drive API OAuth Client

Locate the client with ID: `145904061405-jvsjlhdcy2647grr6b0pl70qh8mv0mq.apps.googleusercontent.com`

> This is a **different** client from 7B (note: `jvsjlhdcy` not `jvsjilhdcv`).

Click **Edit** (pencil icon). Then:

**Authorized JavaScript origins** — add all of these (skip any that already exist):

```bash
http://localhost:3050
https://social-media-genius.vercel.app
https://social.topnetworks.co
```

**Authorized redirect URIs** — add all of these (skip any that already exist):

```bash
http://localhost:3050/api/auth/google-drive/callback
https://social-media-genius.vercel.app/api/auth/google-drive/callback
https://social.topnetworks.co/api/auth/google-drive/callback
```

Click **Save**.

### 7D — Verify OAuth Consent Screen

1. In the left sidebar, click **OAuth consent screen**
2. Confirm **User type** is **Internal** (restricts access to `@topnetworks.co` / `@topfinanzas.com`)
3. Under **Authorized domains**, confirm `topnetworks.co` and `vercel.app` are listed
4. Under **Scopes**, confirm these are present: `email`, `profile`, `openid`, `https://www.googleapis.com/auth/drive.file`

---

## STEP 8 — Trigger redeployments

1. Navigate to: `https://vercel.com/juan-jaramillo/social-media-genius/deployments`
2. Find the most recent **Production** deployment (labeled with "Production" badge)
3. Click the **three-dot menu (⋮)** → click **Redeploy** → confirm
4. Wait for the production redeployment to complete
5. Optionally, if there is a Preview deployment listed, also redeploy it via the same method

---

## STEP 9 — Validate final state

Navigate back to: `https://vercel.com/juan-jaramillo/social-media-genius/settings/environment-variables`

Confirm the following per-environment entries now exist (in addition to all shared entries):

```bash
BETTER_AUTH_URL              Production     → https://social.topnetworks.co
BETTER_AUTH_URL              Preview        → https://social-media-genius.vercel.app
BETTER_AUTH_URL              Development    → http://localhost:3050

NEXT_PUBLIC_APP_URL          Production     → https://social.topnetworks.co
NEXT_PUBLIC_APP_URL          Preview        → https://social-media-genius.vercel.app
NEXT_PUBLIC_APP_URL          Development    → http://localhost:3050

GOOGLE_DRIVE_REDIRECT_URI    Production     → https://social.topnetworks.co/api/auth/google-drive/callback
GOOGLE_DRIVE_REDIRECT_URI    Preview        → https://social-media-genius.vercel.app/api/auth/google-drive/callback
GOOGLE_DRIVE_REDIRECT_URI    Development    → http://localhost:3050/api/auth/google-drive/callback

NODE_ENV                     Production     → production
NODE_ENV                     Preview        → production
NODE_ENV                     Development    → development

PORT                         Development    → 3050

DISABLE_RATE_LIMITING        Production     → false
DISABLE_RATE_LIMITING        Preview        → true
DISABLE_RATE_LIMITING        Development    → true

NEXT_PUBLIC_ENABLE_LOGGING   Production     → false
NEXT_PUBLIC_ENABLE_LOGGING   Preview        → true
NEXT_PUBLIC_ENABLE_LOGGING   Development    → true

SKIP_URL_VALIDATION          Production     → false
SKIP_URL_VALIDATION          Preview        → true
SKIP_URL_VALIDATION          Development    → true
```

If all entries match, report: **"Environment variable provisioning complete. All 3 tiers configured."**

If any entry is missing or incorrect, report exactly which entry failed and what the actual state is.
