# Contributing to Social Media Genius

Thank you for contributing to Social Media Genius! This document outlines the workflow and conventions you must follow.

---

## Table of Contents

- [Branching Strategy](#branching-strategy)
- [Pushing Changes](#pushing-changes)
- [Conventional Commits](#conventional-commits)
- [Code Quality](#code-quality)
- [Development Setup](#development-setup)
- [UI Language](#ui-language)
- [Platform Specifications](#platform-specifications)

---

## Branching Strategy

This project uses a strict three-tier branch architecture:

| Branch    | Purpose            | Deploys To                     |
| --------- | ------------------ | ------------------------------ |
| `dev`     | Active development | Development environment        |
| `staging` | Pre-production QA  | social-media-genius.vercel.app |
| `main`    | Production         | social.topnetworks.co          |

**Workflow:** `Feature Branch` → `dev` → `staging` → `main`

- **Never** push directly to `main`, `staging`, or `production`.
- All feature branches must branch from `dev` and merge back into `dev`.

---

## Pushing Changes

All commits and pushes **must** go through the automated workflow script:

```bash
bash scripts/git-workflow.sh "<commit message>"
```

**Do NOT run raw `git add`, `git commit`, or `git push` commands.** The script handles everything:

1. Stages all changes (`git add -A`)
2. Validates conventional commit format
3. Runs pre-push checks (TypeScript, ESLint, Prettier)
4. Rebases on the remote branch
5. Pushes with a clean history

### Available Flags

| Flag              | Purpose                                                     |
| ----------------- | ----------------------------------------------------------- |
| `--branch <name>` | Target a specific branch                                    |
| `--force`         | Force-push on non-protected branches (`--force-with-lease`) |
| `--verify-build`  | Run `next build` before pushing                             |
| `--skip-format`   | Skip Prettier formatting check                              |
| `--dry-run`       | Run all validation steps but skip the final push            |
| `--help`          | Print usage information                                     |

### Examples

```bash
# Standard push to current branch
bash scripts/git-workflow.sh "feat(editor): add gradient fill support"

# Push to a specific branch
bash scripts/git-workflow.sh "fix(api): handle empty prompt" --branch dev

# Dry run (validate without pushing)
bash scripts/git-workflow.sh "chore: update deps" --dry-run

# Force push a rebased feature branch
bash scripts/git-workflow.sh "refactor(canvas): simplify zoom logic" --force

# Full validation including production build
bash scripts/git-workflow.sh "feat(templates): add LinkedIn presets" --verify-build
```

---

## Conventional Commits

All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```text
<type>(<scope>): <description>
```

### Types

| Type       | When to Use                                     |
| ---------- | ----------------------------------------------- |
| `feat`     | New feature                                     |
| `fix`      | Bug fix                                         |
| `docs`     | Documentation only                              |
| `style`    | Formatting, missing semicolons (no code change) |
| `refactor` | Code change that neither fixes nor adds         |
| `perf`     | Performance improvement                         |
| `test`     | Adding or updating tests                        |
| `chore`    | Build process, dependencies, tooling            |
| `ci`       | CI/CD configuration                             |
| `revert`   | Reverting a previous commit                     |

### Scopes (Common)

`editor`, `canvas`, `api`, `auth`, `imagen`, `veo`, `i18n`, `ui`, `types`, `db`, `deps`

---

## Code Quality

The git workflow script automatically enforces these checks before every push:

1. **TypeScript** — `tsc --noEmit` (zero type errors)
2. **ESLint** — `eslint .` (ESLint 9 flat config)
3. **Prettier** — `prettier --check .` (auto-fixes if possible)

You can run them manually:

```bash
npm run lint        # ESLint
npm run format      # Prettier (write mode)
npx tsc --noEmit    # Type check
```

---

## Development Setup

```bash
# Install dependencies
npm install

# Start dev server (port 3050)
npm run dev

# Build for production
npm run build
```

The app runs on **port 3050** (not 3000) to avoid conflicts with other TopNetworks applications.

---

## UI Language

All user-facing text **must be in Spanish**. This includes:

- Button labels, form fields, tooltips
- Error messages, success messages
- Panel headers, sidebar labels
- Placeholder text

The AI-generated **content output** supports 3 locales (EN, ES, BR) via the i18n system, but the **application interface** is always Spanish.

---

## Platform Specifications

Always use the centralized specs system — **never hardcode** platform limits:

```typescript
import { getPlatformSpec } from "@/lib/social-platform-specs";
const spec = getPlatformSpec(platform);
```

Key 2026 values to be aware of:

- Instagram: **5 hashtags max** (down from 30 in 2025)
- TikTok: **4,000 chars** (up from 2,200)
- Instagram aspect ratio: **4:5 portrait** (not always 1:1)

---

## Questions?

Reach out to the TopNetworks engineering team or open an issue in the repository.

---

© 2026 TopNetworks, Inc.
