#!/usr/bin/env bash
# ============================================================================
# vercel-env-manage.sh — CLI Environment Variable Management for Vercel
# ============================================================================
# Project: social-media-genius
# Vercel Team: juan-jaramillo
# Production URL: https://social.topnetworks.co
#
# Usage:
#   ./scripts/vercel-env-manage.sh <command>
#
# Commands:
#   audit       List all env vars across all Vercel environments
#   pull        Pull development env vars to .env.local
#   pull-prod   Pull production env vars to .env.production.local
#   diff        Compare local .env.example against Vercel environments
#   add         Add a single variable interactively
#   add-all     Bulk-add missing variables from .env.vercel-inject
#   rm          Remove a single variable interactively
#   sync-prod   Push production-specific overrides to Vercel
#   sync-preview Push preview-specific overrides to Vercel
#   reset       Remove ALL env vars from a target environment (destructive)
# ============================================================================

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# HELPERS
# ============================================================================

log_info()  { echo -e "${CYAN}ℹ️  $1${NC}"; }
log_ok()    { echo -e "${GREEN}✅ $1${NC}"; }
log_warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

require_vercel_cli() {
  if ! command -v vercel &>/dev/null; then
    log_error "Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
  fi
}

require_linked() {
  if [[ ! -d ".vercel" ]]; then
    log_warn "Project not linked. Running 'vercel link --yes'..."
    vercel link --yes
  fi
}

# ============================================================================
# COMMANDS
# ============================================================================

cmd_audit() {
  log_info "Listing all environment variables on Vercel..."
  echo ""
  vercel env ls
  echo ""
  log_info "Variable count by environment:"
  vercel env ls 2>/dev/null | grep -c "Production" | xargs -I{} echo "  Production:  {} entries"
  vercel env ls 2>/dev/null | grep -c "Preview"    | xargs -I{} echo "  Preview:     {} entries"
  vercel env ls 2>/dev/null | grep -c "Development" | xargs -I{} echo "  Development: {} entries"
}

cmd_pull() {
  log_info "Pulling development env vars to .env.local..."
  vercel env pull .env.vercel-pulled --environment=development
  log_ok "Pulled to .env.vercel-pulled (not overwriting .env.local)"
  log_info "Review with: diff .env.local .env.vercel-pulled"
}

cmd_pull_prod() {
  log_info "Pulling production env vars to .env.production.local..."
  vercel env pull .env.production.local --environment=production
  log_ok "Pulled to .env.production.local"
}

cmd_diff() {
  log_info "Comparing .env.example keys against Vercel environments..."
  echo ""

  # Extract keys from .env.example (skip comments and empty lines)
  local example_keys
  example_keys=$(grep -E '^[A-Z_]+=' .env.example | cut -d'=' -f1 | sort)

  # Extract keys from Vercel env ls output
  local vercel_keys
  vercel_keys=$(vercel env ls 2>/dev/null | grep "Encrypted" | awk '{print $1}' | sort -u)

  echo "--- Keys in .env.example but NOT on Vercel ---"
  comm -23 <(echo "$example_keys") <(echo "$vercel_keys") | while read -r key; do
    echo -e "  ${RED}MISSING${NC}  $key"
  done

  echo ""
  echo "--- Keys on Vercel but NOT in .env.example ---"
  comm -13 <(echo "$example_keys") <(echo "$vercel_keys") | while read -r key; do
    echo -e "  ${YELLOW}EXTRA${NC}    $key"
  done

  echo ""
  echo "--- Keys present in both ---"
  comm -12 <(echo "$example_keys") <(echo "$vercel_keys") | while read -r key; do
    echo -e "  ${GREEN}OK${NC}       $key"
  done
}

cmd_add() {
  echo ""
  read -rp "Variable name: " var_name
  read -rp "Variable value: " var_value
  echo ""
  echo "Target environments:"
  echo "  1) production"
  echo "  2) preview"
  echo "  3) development"
  echo "  4) production + preview + development (all)"
  echo "  5) production + preview"
  read -rp "Select [1-5]: " env_choice

  case "$env_choice" in
    1) envs=("production") ;;
    2) envs=("preview") ;;
    3) envs=("development") ;;
    4) envs=("production" "preview" "development") ;;
    5) envs=("production" "preview") ;;
    *) log_error "Invalid choice"; exit 1 ;;
  esac

  for env in "${envs[@]}"; do
    echo "$var_value" | vercel env add "$var_name" "$env" 2>&1 && \
      log_ok "Added $var_name to $env" || \
      log_warn "Failed or already exists: $var_name in $env"
  done
}

cmd_add_all() {
  local inject_file="${1:-.env.vercel-inject}"

  if [[ ! -f "$inject_file" ]]; then
    log_error "Injection file not found: $inject_file"
    echo ""
    echo "Create $inject_file with lines in format:"
    echo "  VARIABLE_NAME=value|environment"
    echo ""
    echo "Where environment is one of:"
    echo "  production, preview, development, all, prod+preview"
    echo ""
    echo "Example:"
    echo "  NEXT_PUBLIC_APP_URL=https://social.topnetworks.co|production"
    echo "  BETTER_AUTH_URL=https://social.topnetworks.co|prod+preview"
    echo "  DISABLE_RATE_LIMITING=true|development"
    exit 1
  fi

  log_info "Bulk-adding variables from $inject_file..."
  echo ""

  while IFS= read -r line; do
    # Skip comments and empty lines
    [[ "$line" =~ ^#.*$ || -z "$line" ]] && continue

    # Parse: KEY=VALUE|ENVIRONMENT
    local key value_env value target
    key=$(echo "$line" | cut -d'=' -f1)
    value_env=$(echo "$line" | cut -d'=' -f2-)
    value=$(echo "$value_env" | rev | cut -d'|' -f2- | rev)
    target=$(echo "$value_env" | rev | cut -d'|' -f1 | rev)

    case "$target" in
      all)          envs=("production" "preview" "development") ;;
      prod+preview) envs=("production" "preview") ;;
      production)   envs=("production") ;;
      preview)      envs=("preview") ;;
      development)  envs=("development") ;;
      *)
        log_warn "Unknown target '$target' for $key — skipping"
        continue
        ;;
    esac

    for env in "${envs[@]}"; do
      echo "$value" | vercel env add "$key" "$env" 2>&1 && \
        log_ok "$key → $env" || \
        log_warn "Failed or exists: $key → $env"
    done
  done < "$inject_file"

  echo ""
  log_ok "Bulk injection complete. Run './scripts/vercel-env-manage.sh audit' to verify."
}

cmd_rm() {
  echo ""
  read -rp "Variable name to remove: " var_name
  echo ""
  echo "Remove from which environment?"
  echo "  1) production"
  echo "  2) preview"
  echo "  3) development"
  echo "  4) all (production + preview + development)"
  read -rp "Select [1-4]: " env_choice

  case "$env_choice" in
    1) envs=("production") ;;
    2) envs=("preview") ;;
    3) envs=("development") ;;
    4) envs=("production" "preview" "development") ;;
    *) log_error "Invalid choice"; exit 1 ;;
  esac

  for env in "${envs[@]}"; do
    vercel env rm "$var_name" "$env" --yes 2>&1 && \
      log_ok "Removed $var_name from $env" || \
      log_warn "Failed to remove $var_name from $env (may not exist)"
  done
}

cmd_sync_prod() {
  log_info "Syncing production-specific overrides..."
  echo ""

  # Production-specific values
  declare -A PROD_VARS=(
    ["NODE_ENV"]="production"
    ["NEXT_PUBLIC_APP_URL"]="https://social.topnetworks.co"
    ["BETTER_AUTH_URL"]="https://social.topnetworks.co"
    ["GOOGLE_DRIVE_REDIRECT_URI"]="https://social.topnetworks.co/api/auth/google-drive/callback"
  )

  for key in "${!PROD_VARS[@]}"; do
    local value="${PROD_VARS[$key]}"
    # Remove existing first, then re-add
    vercel env rm "$key" production --yes 2>/dev/null || true
    echo "$value" | vercel env add "$key" production 2>&1 && \
      log_ok "$key=$value → production" || \
      log_error "Failed: $key → production"
  done

  echo ""
  log_ok "Production overrides synced."
}

cmd_sync_preview() {
  log_info "Syncing preview-specific overrides..."
  echo ""
  log_warn "Preview uses Vercel's auto-injected VERCEL_URL."
  log_info "The app's lib/auth.ts already falls back to VERCEL_URL when"
  log_info "BETTER_AUTH_URL is not set. No explicit override needed."
  echo ""

  # Preview doesn't need URL overrides — VERCEL_URL is auto-injected.
  # But we still ensure NODE_ENV is set for preview.
  vercel env rm "NODE_ENV" preview --yes 2>/dev/null || true
  echo "production" | vercel env add "NODE_ENV" preview 2>&1 && \
    log_ok "NODE_ENV=production → preview" || \
    log_error "Failed: NODE_ENV → preview"

  echo ""
  log_ok "Preview overrides synced."
}

cmd_reset() {
  echo ""
  echo "⚠️  DESTRUCTIVE OPERATION — removes ALL env vars from a target environment."
  echo ""
  echo "  1) production"
  echo "  2) preview"
  echo "  3) development"
  read -rp "Select environment to reset [1-3]: " env_choice

  case "$env_choice" in
    1) target="production" ;;
    2) target="preview" ;;
    3) target="development" ;;
    *) log_error "Invalid choice"; exit 1 ;;
  esac

  echo ""
  read -rp "Type '$target' to confirm: " confirm
  if [[ "$confirm" != "$target" ]]; then
    log_error "Aborted."
    exit 1
  fi

  log_warn "Removing all variables from $target..."
  vercel env ls 2>/dev/null | grep "$target" | awk '{print $1}' | sort -u | while read -r key; do
    [[ -z "$key" || "$key" == "name" ]] && continue
    vercel env rm "$key" "$target" --yes 2>/dev/null && \
      log_ok "Removed $key from $target" || \
      log_warn "Could not remove $key from $target"
  done

  echo ""
  log_ok "Reset complete for $target."
}

# ============================================================================
# MAIN
# ============================================================================

require_vercel_cli
require_linked

case "${1:-help}" in
  audit)        cmd_audit ;;
  pull)         cmd_pull ;;
  pull-prod)    cmd_pull_prod ;;
  diff)         cmd_diff ;;
  add)          cmd_add ;;
  add-all)      cmd_add_all "${2:-}" ;;
  rm)           cmd_rm ;;
  sync-prod)    cmd_sync_prod ;;
  sync-preview) cmd_sync_preview ;;
  reset)        cmd_reset ;;
  help|*)
    echo ""
    echo "Usage: ./scripts/vercel-env-manage.sh <command>"
    echo ""
    echo "Commands:"
    echo "  audit        List all env vars across all Vercel environments"
    echo "  pull         Pull development env vars (safe — writes to .env.vercel-pulled)"
    echo "  pull-prod    Pull production env vars to .env.production.local"
    echo "  diff         Compare .env.example keys vs Vercel"
    echo "  add          Add a single variable interactively"
    echo "  add-all      Bulk-add from .env.vercel-inject file"
    echo "  rm           Remove a single variable interactively"
    echo "  sync-prod    Push production URL/NODE_ENV overrides"
    echo "  sync-preview Push preview NODE_ENV override"
    echo "  reset        Remove ALL vars from an environment (destructive)"
    echo ""
    ;;
esac
