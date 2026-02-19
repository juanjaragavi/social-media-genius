# Browser Agent Prompt — Vercel Development Environment Variable Provisioning

You are a browser automation agent. Execute the following instructions **exactly and in order**. Do not skip steps, improvise, or modify any values. Each step specifies a precise action in the Vercel dashboard.

---

## Context

**Project**: Social Media Genius
**Dashboard URL**: `https://vercel.com/juan-jaramillo/social-media-genius/settings/environment-variables`
**Account**: juan-jaramillo (TopNetworks)
**Target Environment**: **Development** only
**Associated Git Branch**: `dev` (local development and testing only — never pushed to remote)
**Local Dev URL**: `http://localhost:3050`

---

## Pre-Conditions

Before proceeding, confirm that:

1. You can access the Vercel dashboard at the URL above.
2. The project "social-media-genius" is visible under the juan-jaramillo account.
3. The Environment Variables settings page loads and shows the existing variable table.

If any pre-condition fails, **stop and report the failure**.

---

## STEP 1 — Navigate to Environment Variables

1. Open the URL: `https://vercel.com/juan-jaramillo/social-media-genius/settings/environment-variables`
2. Wait for the page to fully load.
3. Confirm you see the environment variables table with existing entries.

---

## STEP 2 — Audit Existing Development-Scoped Variables

Before adding anything, scroll through the variable list and check whether the following variables already exist with a **Development** scope. Record the result for each:

| Variable                     | Expected Value (Development)                           | Action if exists | Action if missing |
| ---------------------------- | ------------------------------------------------------ | ---------------- | ----------------- |
| `BETTER_AUTH_URL`            | `http://localhost:3050`                                | Verify value     | Add in Step 3     |
| `NEXT_PUBLIC_APP_URL`        | `http://localhost:3050`                                | Verify value     | Add in Step 3     |
| `GOOGLE_DRIVE_REDIRECT_URI`  | `http://localhost:3050/api/auth/google-drive/callback` | Verify value     | Add in Step 3     |
| `NODE_ENV`                   | `development`                                          | Verify value     | Add in Step 3     |
| `PORT`                       | `3050`                                                 | Verify value     | Add in Step 3     |
| `DISABLE_RATE_LIMITING`      | `true`                                                 | Verify value     | Add in Step 3     |
| `NEXT_PUBLIC_ENABLE_LOGGING` | `true`                                                 | Verify value     | Add in Step 3     |
| `SKIP_URL_VALIDATION`        | `true`                                                 | Verify value     | Add in Step 3     |

If a variable exists with a **Development** scope but has an **incorrect value**, delete that entry first (three-dot menu → Remove → confirm), then proceed to add it in Step 3 with the correct value.

If a variable exists with the correct value and Development scope, **skip it** in Step 3.

---

## STEP 3 — Add Development-Only Variables

For each variable in the table below that was identified as **missing** or **deleted for correction** in Step 2, perform the following:

1. Click the **"Add New"** button.
2. Enter the **Key** (variable name) exactly as shown.
3. Enter the **Value** exactly as shown.
4. Under **Environments**, **uncheck all boxes**, then check **only "Development"**.
5. Click **Save**.
6. Wait for the confirmation toast/banner before proceeding to the next entry.

### 3A — URL-Based Variables (environment-specific endpoints)

| #   | Key                         | Value                                                  |
| --- | --------------------------- | ------------------------------------------------------ |
| 1   | `BETTER_AUTH_URL`           | `http://localhost:3050`                                |
| 2   | `NEXT_PUBLIC_APP_URL`       | `http://localhost:3050`                                |
| 3   | `GOOGLE_DRIVE_REDIRECT_URI` | `http://localhost:3050/api/auth/google-drive/callback` |

### 3B — Runtime Configuration

| #   | Key        | Value         |
| --- | ---------- | ------------- |
| 4   | `NODE_ENV` | `development` |
| 5   | `PORT`     | `3050`        |

### 3C — Feature Flags (relaxed for local development)

| #   | Key                          | Value  |
| --- | ---------------------------- | ------ |
| 6   | `DISABLE_RATE_LIMITING`      | `true` |
| 7   | `NEXT_PUBLIC_ENABLE_LOGGING` | `true` |
| 8   | `SKIP_URL_VALIDATION`        | `true` |

**Maximum entries to add**: 8 (fewer if some already existed with correct values).

---

## STEP 4 — Verify Shared Variables Are Scoped to Include Development

The following variables must be scoped to **all three environments** (Development, Preview, Production). They carry secrets/credentials that are identical across all tiers. Scroll through the table and confirm each one shows **Development** in its environments column.

**Do NOT modify these — read-only verification only.**

| #   | Variable Name                              | Expected Scope                   |
| --- | ------------------------------------------ | -------------------------------- |
| 1   | `BETTER_AUTH_SECRET`                       | Development, Preview, Production |
| 2   | `GOOGLE_OAUTH_CLIENT_ID`                   | Development, Preview, Production |
| 3   | `GOOGLE_OAUTH_CLIENT_SECRET`               | Development, Preview, Production |
| 4   | `GOOGLE_CLOUD_PROJECT`                     | Development, Preview, Production |
| 5   | `GOOGLE_CLOUD_LOCATION`                    | Development, Preview, Production |
| 6   | `GOOGLE_SERVICE_ACCOUNT_EMAIL`             | Development, Preview, Production |
| 7   | `GOOGLE_PRIVATE_KEY`                       | Development, Preview, Production |
| 8   | `GCS_BUCKET_NAME`                          | Development, Preview, Production |
| 9   | `GCS_CLIENT_EMAIL`                         | Development, Preview, Production |
| 10  | `GCS_PROJECT_ID`                           | Development, Preview, Production |
| 11  | `GOOGLE_DRIVE_CLIENT_ID`                   | Development, Preview, Production |
| 12  | `GOOGLE_DRIVE_CLIENT_SECRET`               | Development, Preview, Production |
| 13  | `GOOGLE_DRIVE_FOLDER_ID`                   | Development, Preview, Production |
| 14  | `NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID`       | Development, Preview, Production |
| 15  | `NEXT_PUBLIC_GOOGLE_PICKER_API_KEY`        | Development, Preview, Production |
| 16  | `NEXT_PUBLIC_GOOGLE_PICKER_APP_ID`         | Development, Preview, Production |
| 17  | `NEXT_PUBLIC_FIREBASE_API_KEY`             | Development, Preview, Production |
| 18  | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Development, Preview, Production |
| 19  | `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Development, Preview, Production |
| 20  | `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Development, Preview, Production |
| 21  | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Development, Preview, Production |
| 22  | `NEXT_PUBLIC_FIREBASE_APP_ID`              | Development, Preview, Production |
| 23  | `NEXT_PUBLIC_GA_MEASUREMENT_ID`            | Development, Preview, Production |
| 24  | `NEXT_PUBLIC_SUPABASE_URL`                 | Development, Preview, Production |
| 25  | `NEXT_PUBLIC_SUPABASE_ANON_KEY`            | Development, Preview, Production |
| 26  | `SUPABASE_SERVICE_ROLE_KEY`                | Development, Preview, Production |
| 27  | `SUPABASE_DB_URL`                          | Development, Preview, Production |
| 28  | `DATABASE_URL`                             | Development, Preview, Production |
| 29  | `DB_HOST`                                  | Development, Preview, Production |
| 30  | `DB_PORT`                                  | Development, Preview, Production |
| 31  | `DB_NAME`                                  | Development, Preview, Production |
| 32  | `DB_USER`                                  | Development, Preview, Production |
| 33  | `DB_PASSWORD`                              | Development, Preview, Production |
| 34  | `DB_CONNECTION_NAME`                       | Development, Preview, Production |
| 35  | `NEXT_PUBLIC_APP_NAME`                     | Development, Preview, Production |

If any shared variable is **missing the Development scope**, report it as a discrepancy but do **not** modify it.

---

## STEP 5 — Pull Development Environment Variables Locally

After all entries are confirmed, instruct the developer to synchronize the Vercel Development variables to their local `.env.local` by running:

```bash
cd /Users/macbookpro/GitHub/social-media-genius && vercel env pull .env.local --environment=development
```

> This command requires the Vercel CLI (`npm i -g vercel`) and an active login session (`vercel login`).

---

## STEP 6 — Final Validation

Navigate back to: `https://vercel.com/juan-jaramillo/social-media-genius/settings/environment-variables`

Confirm the following Development-scoped entries exist with the exact values shown:

```bash
BETTER_AUTH_URL              Development    → http://localhost:3050
NEXT_PUBLIC_APP_URL          Development    → http://localhost:3050
GOOGLE_DRIVE_REDIRECT_URI   Development    → http://localhost:3050/api/auth/google-drive/callback
NODE_ENV                     Development    → development
PORT                         Development    → 3050
DISABLE_RATE_LIMITING        Development    → true
NEXT_PUBLIC_ENABLE_LOGGING   Development    → true
SKIP_URL_VALIDATION          Development    → true
```

### Success Criteria

All 8 Development-only entries are present with correct values, AND all 35 shared entries include the Development scope.

**If all entries match**, report:

> **"Development environment provisioning complete. 8 Development-scoped entries verified. 35 shared entries confirmed to include Development scope. Run `vercel env pull .env.local --environment=development` on the `dev` branch to sync locally."**

**If any entry is missing or incorrect**, report exactly which entry failed, what the expected state was, and what the actual state is.
