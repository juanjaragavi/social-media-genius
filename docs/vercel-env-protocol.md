# Vercel CLI Environment Variable Management Protocol

**Project:** social-media-genius  
**Vercel Team:** juan-jaramillo  
**Production URL:** <https://social.topnetworks.co>

---

## Prerequisites

```bash
# Verify CLI (v50+)
vercel --version

# Verify authentication
vercel whoami
# Expected: juanjaragavi

# Link project (one-time, creates .vercel/ directory)
cd /Users/macbookpro/GitHub/social-media-genius
vercel link --yes
```

---

## 1. Audit — Read Current State

### List all variables across environments

```bash
vercel env ls
```

### Pull development variables locally (non-destructive)

```bash
# Pulls to a review file, NOT your working .env.local
./scripts/vercel-env-manage.sh pull
# → writes .env.vercel-pulled

# Compare against your working config
diff .env.local .env.vercel-pulled
```

### Pull production variables

```bash
./scripts/vercel-env-manage.sh pull-prod
# → writes .env.production.local
```

### Diff local .env.example against Vercel

```bash
./scripts/vercel-env-manage.sh diff
```

This shows:

- **MISSING**: Keys in `.env.example` that don't exist on Vercel
- **EXTRA**: Keys on Vercel that aren't in `.env.example`
- **OK**: Keys present in both

---

## 2. Add / Update Variables

### Single variable (interactive)

```bash
./scripts/vercel-env-manage.sh add
# Prompts for: name, value, target environment(s)
```

### Raw CLI (non-interactive, pipe-friendly)

```bash
# Add to a single environment
echo "my-value" | vercel env add MY_VAR production

# Add to multiple environments (one command each)
echo "my-value" | vercel env add MY_VAR production
echo "my-value" | vercel env add MY_VAR preview
echo "my-value" | vercel env add MY_VAR development
```

### Update an existing variable (remove + re-add)

```bash
vercel env rm MY_VAR production --yes
echo "new-value" | vercel env add MY_VAR production
```

### Bulk injection from file

```bash
# Edit .env.vercel-inject with your variables
# Format: KEY=VALUE|TARGET  (targets: production, preview, development, all, prod+preview)
./scripts/vercel-env-manage.sh add-all
```

---

## 3. Remove Variables

### Single variable (interactive)

```bash
./scripts/vercel-env-manage.sh rm
```

### Raw CLI

```bash
vercel env rm MY_VAR production --yes
vercel env rm MY_VAR preview --yes
vercel env rm MY_VAR development --yes
```

---

## 4. Environment-Specific Overrides

### Production overrides (one command)

```bash
./scripts/vercel-env-manage.sh sync-prod
```

This sets:

| Variable                    | Value                                                          |
| --------------------------- | -------------------------------------------------------------- |
| `NODE_ENV`                  | `production`                                                   |
| `NEXT_PUBLIC_APP_URL`       | `https://social.topnetworks.co`                                |
| `BETTER_AUTH_URL`           | `https://social.topnetworks.co`                                |
| `GOOGLE_DRIVE_REDIRECT_URI` | `https://social.topnetworks.co/api/auth/google-drive/callback` |

### Preview overrides

```bash
./scripts/vercel-env-manage.sh sync-preview
```

Preview relies on Vercel's auto-injected `VERCEL_URL`. The auth system at `lib/auth.ts` already handles this fallback chain:

```
BETTER_AUTH_URL → https://${VERCEL_URL} → NEXT_PUBLIC_APP_URL → localhost:3050
```

Only `NODE_ENV=production` is explicitly set for preview.

---

## 5. Variable Mapping by Environment

### Three-tier mapping

| Variable                    | Development                                            | Preview                      | Production                                                     |
| --------------------------- | ------------------------------------------------------ | ---------------------------- | -------------------------------------------------------------- |
| `NODE_ENV`                  | _(not set — defaults to development)_                  | `production`                 | `production`                                                   |
| `NEXT_PUBLIC_APP_URL`       | `http://localhost:3050`                                | _(uses VERCEL_URL)_          | `https://social.topnetworks.co`                                |
| `BETTER_AUTH_URL`           | `http://localhost:3050`                                | _(uses VERCEL_URL fallback)_ | `https://social.topnetworks.co`                                |
| `GOOGLE_DRIVE_REDIRECT_URI` | `http://localhost:3050/api/auth/google-drive/callback` | _(not set)_                  | `https://social.topnetworks.co/api/auth/google-drive/callback` |
| All other vars              | Shared value                                           | Shared value                 | Shared value                                                   |

### Variables shared across ALL environments (same value)

```
GOOGLE_CLOUD_PROJECT, GOOGLE_CLOUD_LOCATION, GOOGLE_SERVICE_ACCOUNT_EMAIL,
GOOGLE_PRIVATE_KEY, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD,
DB_CONNECTION_NAME, DATABASE_URL, SUPABASE_DB_URL,
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
BETTER_AUTH_SECRET, GOOGLE_OAUTH_CLIENT_ID, GOOGLE_OAUTH_CLIENT_SECRET,
GCS_BUCKET_NAME, GCS_PROJECT_ID, GCS_CLIENT_EMAIL,
GOOGLE_DRIVE_FOLDER_ID, GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET,
NEXT_PUBLIC_GOOGLE_PICKER_API_KEY, NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID,
NEXT_PUBLIC_GOOGLE_PICKER_APP_ID,
NEXT_PUBLIC_FIREBASE_API_KEY, NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, NEXT_PUBLIC_FIREBASE_APP_ID,
NEXT_PUBLIC_GA_MEASUREMENT_ID, NEXT_PUBLIC_APP_NAME
```

### Local-only variables (NOT on Vercel)

```
PORT=3050                          # Vercel handles ports
DISABLE_RATE_LIMITING=true         # Dev convenience
NEXT_PUBLIC_ENABLE_LOGGING=true    # Dev convenience
SKIP_URL_VALIDATION=true           # Dev convenience
```

---

## 6. Common Operations Cheatsheet

```bash
# Full audit
./scripts/vercel-env-manage.sh audit

# After changing a shared secret (e.g., rotating BETTER_AUTH_SECRET)
vercel env rm BETTER_AUTH_SECRET production --yes
vercel env rm BETTER_AUTH_SECRET preview --yes
vercel env rm BETTER_AUTH_SECRET development --yes
echo "new-secret-value" | vercel env add BETTER_AUTH_SECRET production
echo "new-secret-value" | vercel env add BETTER_AUTH_SECRET preview
echo "new-secret-value" | vercel env add BETTER_AUTH_SECRET development

# After adding a new feature requiring a new env var
echo "value" | vercel env add NEW_VAR production
echo "value" | vercel env add NEW_VAR preview
echo "value" | vercel env add NEW_VAR development

# Force redeploy after env var changes (production)
vercel --prod

# Force redeploy preview (latest commit)
vercel

# Verify changes took effect
vercel env ls | grep NEW_VAR
```

---

## 7. Recovery — Nuclear Reset

```bash
# Wipe ALL variables from an environment and re-inject
./scripts/vercel-env-manage.sh reset
# Then re-inject from file:
./scripts/vercel-env-manage.sh add-all
```

---

## Files

| File                           | Purpose                                                        |
| ------------------------------ | -------------------------------------------------------------- |
| `scripts/vercel-env-manage.sh` | CLI management script (all commands)                           |
| `.env.vercel-inject`           | Bulk injection template (edit before running `add-all`)        |
| `.env.example`                 | Canonical key reference (all keys, empty values)               |
| `.env.local`                   | Local development config (pulled + patched with dev overrides) |
| `.env.vercel-pulled`           | Latest pull from Vercel dev (gitignored, for diff review)      |
| `.env.production.local`        | Latest pull from Vercel prod (gitignored, for review)          |
