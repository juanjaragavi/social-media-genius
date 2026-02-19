---
name: devops-deployment
description: Environment configuration, CI/CD conventions, Vercel deployment standards, PM2 process management, Git workflow automation, and environment variable management for TopNetworks properties. Use when configuring deployments, managing environments, running builds, or setting up new projects.
---

# DevOps / Deployment — TopNetworks, Inc.

This skill governs environment configuration, deployment pipelines, and operational procedures across all TopNetworks properties. Derived from route-genius (Vercel + PR-based promotion), topfinanzas-us-next (PM2 + Apache on GCP Compute Engine), and emailgenius-broadcasts-generator (GCP Compute Engine + PM2).

---

## Scope

**Use for:** Local development setup, environment variable configuration, build commands, deployment procedures (Vercel and self-hosted), PM2 process management, git workflow automation, and branch promotion strategies.

**Not for:** Application code (see `frontend`, `backend`, `database` skills), schema migrations (see `database` skill), or auth configuration (see `authentication` skill).

---

## Deployment Models by Project

| Project                          | Host               | Method                     | Branch Strategy            |
| -------------------------------- | ------------------ | -------------------------- | -------------------------- |
| route-genius                     | Vercel             | PR-based promotion         | `dev` → `staging` → `main` |
| topfinanzas-us-next              | GCP Compute Engine | PM2 + Apache reverse proxy | `dev` → `main` → `backup`  |
| uk-topfinanzas-com               | GCP Compute Engine | PM2 + Apache reverse proxy | `dev` → `main` → `backup`  |
| topfinanzas-mx-next              | GCP Compute Engine | PM2 + Apache reverse proxy | `dev` → `main` → `backup`  |
| budgetbee-next                   | GCP Compute Engine | PM2 + Apache reverse proxy | `dev` → `main` → `backup`  |
| kardtrust                        | GCP Compute Engine | PM2 + Apache reverse proxy | `dev` → `main` → `backup`  |
| mejoresfinanzas                  | Netlify / Vercel   | Static build (Astro)       | `main`                     |
| emailgenius-broadcasts-generator | GCP Compute Engine | PM2                        | `main`                     |
| topAds-main                      | GCP Compute Engine | Docker + Nginx             | `main`                     |
| arbitrage-manager-dashboard      | Google Cloud Run   | Container                  | `main`                     |

---

## Development Environment Setup

### Standard Setup (Next.js Projects)

```bash
# Clone repository
git clone git@github.com:TopNetworks/[repo-name].git
cd [repo-name]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with actual values

# Start development server
npm run dev
```

### Port Assignments

| Project                          | Dev Port |
| -------------------------------- | -------- |
| topfinanzas-us-next              | 3040     |
| uk-topfinanzas-com               | 3004     |
| kardtrust                        | 3005     |
| budgetbee-next                   | 3007     |
| emailgenius-broadcasts-generator | 3020     |
| route-genius                     | 3070     |
| mejoresfinanzas (Astro)          | 4322     |

When starting a project on its assigned port:

```bash
# Next.js — specify port in package.json scripts
"dev": "next dev --port 3040"

# Or via CLI
npm run dev -- --port 3040
```

### Astro Projects (mejoresfinanzas, financial-blog-template)

```bash
pnpm install    # Uses pnpm, not npm
pnpm dev        # Starts dev server (port 4322)
pnpm build      # Production build to ./dist/
pnpm preview    # Preview the production build
```

---

## Branch Strategy

### Route-Genius (Vercel — PR-Based Promotion)

Strict linear promotion pipeline. **No shortcuts.**

```
dev  ──PR──▶  staging  ──PR──▶  main
│              │                │
localhost:3070  route-genius     route.topnetworks.co
               .vercel.app
```

**Branch roles:**

| Branch    | Purpose            | Who commits             | Deploys to        |
| --------- | ------------------ | ----------------------- | ----------------- |
| `dev`     | Active development | All developers          | Local only        |
| `staging` | Pre-production QA  | PR merge from `dev`     | Vercel preview    |
| `main`    | Production         | PR merge from `staging` | Vercel production |

**Promotion requirements:**

- `dev` → `staging`: PR must pass lint + build checks, ≥1 approving review
- `staging` → `main`: QA validation documented in PR description, ≥1 approving review

**Prohibited:**

- Direct commits to `staging` or `main`
- Force-push to `staging` or `main`
- Merging `dev` directly into `main` (skipping `staging`)

```bash
# Standard development workflow
git checkout dev
git pull origin dev
# ... make changes ...
git add [specific files]
git commit -m "feat: description of change"
git push origin dev
# → Open PR: dev → staging on GitHub
```

### Financial Content Platforms (GCP — Automated Script)

These projects use an automated git workflow script. **NEVER bypass this script.**

```bash
# Step 1: Write your commit message
# Edit: /lib/documents/commit-message.txt

# Step 2: Run the automation script
bash ./scripts/git-workflow.sh
```

The script:

1. Reads commit message from `lib/documents/commit-message.txt`
2. Stages all changes and commits to `dev` branch
3. Optionally merges to `main` and `backup` branches
4. Handles merge conflicts automatically

**Trigger phrase** (when user says "Push and commit our latest changes"):

1. Clear `lib/documents/commit-message.txt`
2. Run `git status` to review changes
3. Write accurate commit message to `lib/documents/commit-message.txt`
4. Execute `bash ./scripts/git-workflow.sh`

---

## Vercel Deployment Configuration

### vercel.json (route-genius)

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_APP_URL": "@next-public-app-url"
  }
}
```

Environment variables are configured in the Vercel dashboard per environment (Development, Preview, Production). Never commit actual env values to the repository.

### next.config.mjs (Common Configuration)

```javascript
// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  // Turbopack in development (Next.js 16)
  experimental: {
    turbopack: true, // Only for Next.js 16+
  },
};

export default nextConfig;
```

---

## PM2 Production Deployment (GCP Compute Engine)

All self-hosted Next.js properties run under PM2 on Ubuntu 22.04 VMs managed as `www-data` user.

### Standard Deployment Procedure

```bash
# SSH into the production VM
ssh [vm-address]

# Navigate to project
cd /var/www/html/[project-name]

# Pull latest changes
sudo -u www-data git pull origin main

# Install any new dependencies
sudo -u www-data npm install

# Build the application
sudo -u www-data npm run build

# Restart PM2 process
sudo -u www-data pm2 restart [app-name]

# Verify deployment
sudo -u www-data pm2 status
sudo -u www-data pm2 logs [app-name] --lines 50
```

### PM2 ecosystem.config.js

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "topfinanzas-us",
      script: "node_modules/.bin/next",
      args: "start --port 3040",
      cwd: "/var/www/html/topfinanzas-us-next",
      env: {
        NODE_ENV: "production",
        PORT: 3040,
      },
      instances: 1, // Single instance (not cluster mode)
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};
```

### Common PM2 Commands

```bash
# Process management
sudo -u www-data pm2 status                    # Show all processes
sudo -u www-data pm2 restart [name]            # Restart a process
sudo -u www-data pm2 stop [name]               # Stop a process
sudo -u www-data pm2 start ecosystem.config.js # Start from config
sudo -u www-data pm2 save                      # Persist process list
sudo -u www-data pm2 startup                   # Enable auto-start on boot

# Monitoring
sudo -u www-data pm2 logs [name] --lines 50    # View recent logs
sudo -u www-data pm2 monit                     # Real-time monitoring
sudo -u www-data pm2 describe [name]           # Process details
```

### Apache Reverse Proxy Configuration

Apache 2.0 sits in front of PM2 processes and handles SSL termination:

```apache
# /etc/apache2/sites-available/topfinanzas-us.conf
<VirtualHost *:443>
    ServerName us.topfinanzas.com
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/us.topfinanzas.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/us.topfinanzas.com/privkey.pem

    ProxyPreserveHost On
    ProxyPass / http://localhost:3040/
    ProxyPassReverse / http://localhost:3040/

    # Headers
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
</VirtualHost>
```

SSL certificates managed by Let's Encrypt (Certbot). Renewal is automatic via cron.

---

## Environment Variable Management

### Naming Conventions

```bash
# Browser-safe (public) — use sparingly, no sensitive data
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_GTM_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Server-only (sensitive) — no NEXT_PUBLIC_ prefix
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLIENT_SECRET=
BREVO_API_KEY=
DATABASE_URL=
GOOGLE_PRIVATE_KEY=      # PEM — load with .replace(/\\n/g, '\n')
```

### Required Variables by Project Type

**All Next.js financial platforms:**

```bash
NEXT_PUBLIC_GTM_ID=              # Google Tag Manager container ID
NEXT_PUBLIC_GOOGLE_ADS_ID=       # Google Ads conversion ID
BREVO_API_KEY=                   # Email marketing
NEXT_PUBLIC_ENABLE_LOGGING=      # Set "true" to enable Pino logger in production
```

**Route-Genius:**

```bash
NEXT_PUBLIC_APP_URL=             # Canonical URL
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
SUPABASE_SERVICE_ROLE_KEY=       # Service role (bypasses RLS)
DATABASE_URL=                    # PostgreSQL for Better Auth sessions
GOOGLE_CLIENT_ID=                # Google OAuth
GOOGLE_CLIENT_SECRET=
GCS_PROJECT_ID=                  # Cloud Storage for avatars
GCS_CLIENT_EMAIL=
GCS_PRIVATE_KEY=
GOOGLE_DRIVE_CLIENT_ID=          # Google Drive backup
GOOGLE_DRIVE_CLIENT_SECRET=
NEXT_PUBLIC_GOOGLE_PICKER_API_KEY=
NEXT_PUBLIC_FIREBASE_API_KEY=    # Firebase Crashlytics
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_GA_MEASUREMENT_ID=   # Google Analytics
DISABLE_RATE_LIMITING=           # Set "true" in development
```

**EmailGenius:**

```bash
GOOGLE_CLOUD_PROJECT=            # GCP project for Vertex AI
GOOGLE_SERVICE_ACCOUNT_EMAIL=    # Service account
GOOGLE_PRIVATE_KEY=              # Service account private key
DB_HOST=                         # Cloud SQL host
DB_PORT=5432
DB_NAME=
DB_USER=
DB_PASSWORD=
CONVERTKIT_API_KEY=
```

### .env File Structure

Every project should have:

```
.env.example          # Template — committed to git (no real values)
.env.local            # Local development — gitignored
.env.production       # Production values — never committed to git
```

`.env.example` format:

```bash
# Required
NEXT_PUBLIC_APP_URL=https://your-app.example.com
DATABASE_URL=postgres://user:password@host:5432/dbname

# Optional
NEXT_PUBLIC_ENABLE_LOGGING=false
DISABLE_RATE_LIMITING=false
```

---

## Build Scripts

### Standard Next.js Commands

```bash
npm run dev      # Development server (with HMR)
npm run build    # Production build — MUST pass before deployment
npm run start    # Start production server locally
npm run lint     # ESLint check
npm run format   # Prettier auto-fix
```

**Important for route-genius (Next.js 16):**

```bash
# next lint was removed in Next.js 16 — use eslint directly
npx eslint .     # NOT: npm run next lint
npm run lint     # Wraps: eslint . (configured in package.json)
```

### Pre-Deployment Checklist

Before deploying to staging or production:

- [ ] `npm run build` completes without errors
- [ ] `npm run lint` passes with zero errors
- [ ] No TypeScript `any` types without justification
- [ ] No `console.log()` statements (use `logger`)
- [ ] Environment variables verified in target environment
- [ ] Blog post arrays synchronized (if content was added/modified)
- [ ] Search index updated (if new content added — topfinanzas-us-next)
- [ ] Images optimized (WebP format, proper dimensions)
- [ ] Mobile-first responsive design verified

---

## Google Cloud Platform

### Compute Engine VM Management

```bash
# Connect to VM
gcloud compute ssh [instance-name] --zone [zone] --project [project-id]

# Check disk usage (important — build can fail if disk full)
df -h

# Check Node.js version
node --version   # Should be 18.x or 20.x LTS

# Clear npm cache if needed
npm cache clean --force

# PM2 startup (one-time setup)
sudo -u www-data pm2 startup systemd -u www-data --hp /home/www-data
```

### Cloud Storage (Media CDN)

Media assets are served from Google Cloud Storage:

- Bucket: `media-topfinanzas-com`
- Public URL: `https://storage.googleapis.com/media-topfinanzas-com/`
- Path structure: `images/{market}/{filename}.webp`

Upload new media assets:

```bash
gsutil cp local-image.webp gs://media-topfinanzas-com/images/us/image-name.webp
gsutil acl ch -u AllUsers:R gs://media-topfinanzas-com/images/us/image-name.webp
```

---

## Docker Deployment (topAds-main)

```bash
# Build image
docker build -t topads-main .

# Run container
docker run -d \
  --name topads \
  --restart unless-stopped \
  -p 8080:8080 \
  --env-file .env \
  topads-main

# Nginx reverse proxy configuration handles SSL termination
# Config in /etc/nginx/sites-available/topads
```

---

## Cloud Run (arbitrage-manager-dashboard — Python FastAPI)

```bash
# Build and push container
gcloud builds submit --tag gcr.io/[project-id]/arbitrage-dashboard

# Deploy to Cloud Run
gcloud run deploy arbitrage-dashboard \
  --image gcr.io/[project-id]/arbitrage-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars META_ACCESS_TOKEN=[token]
```

---

## Troubleshooting Common Issues

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next
npm run build

# TypeScript errors — must be zero
npx tsc --noEmit

# Dependency issues
rm -rf node_modules package-lock.json
npm install
```

### PM2 Issues

```bash
# Process not starting — check logs
sudo -u www-data pm2 logs [name] --lines 100 --err

# Port already in use
sudo lsof -i :[port]
sudo kill -9 [pid]

# PM2 not running on startup
sudo -u www-data pm2 startup
sudo -u www-data pm2 save
```

### Environment Variable Issues

```bash
# Verify variable is loaded
sudo -u www-data pm2 env [app-id]

# Reload environment without restart
sudo -u www-data pm2 reload [name]

# Check variable escaping for private keys
# GOOGLE_PRIVATE_KEY must have literal \n in .env file
# Load in code: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
```

---

## Logging (Production)

Pino logger writes to stdout/stderr. PM2 captures and rotates logs automatically.

```bash
# View live logs
sudo -u www-data pm2 logs [name]

# View error logs only
sudo -u www-data pm2 logs [name] --err

# Clear logs
sudo -u www-data pm2 flush [name]

# Log location
ls /home/www-data/.pm2/logs/
```

Logger is disabled by default in production. Enable with:

```bash
NEXT_PUBLIC_ENABLE_LOGGING=true  # Add to environment
sudo -u www-data pm2 reload [name]
```

---

## Constraints

- **Never** commit actual environment variable values to git — use `.env.example` for templates
- **Never** use `npm install -g` on production VMs — install locally per project
- **Never** bypass the automated git workflow script (`git-workflow.sh`) in financial platform repos
- **Never** push directly to `main` in route-genius — always go through `dev` → `staging` → `main`
- **Never** use `pm2 kill` in production — use `pm2 restart` or `pm2 reload` (graceful)
- **Never** run `npm install` or `npm run build` as root — always `sudo -u www-data`
- **Never** force-push to `staging` or `main` branches
- The `GOOGLE_PRIVATE_KEY` environment variable contains literal `\n` characters that must be replaced with actual newlines: `.replace(/\\n/g, '\n')`
- Vercel preview deployments (from `staging` branch) are ephemeral — do not use preview URLs for production testing
- SSL certificates (Let's Encrypt) renew automatically — do not manually renew unless expiry is imminent and auto-renewal has failed
