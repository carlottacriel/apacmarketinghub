#!/bin/bash
# APAC Marketing Hub — one-command deploy
# Usage: ./deploy.sh
# Usage: ./deploy.sh "optional commit message"

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
SITE_NAME="apacmarketinghub"

cd "$REPO_DIR"

echo "── Checking for changes ──────────────────────────────"
if git diff --quiet && git diff --cached --quiet && [ -z "$(git ls-files --others --exclude-standard)" ]; then
  echo "✓ Nothing to commit — files are already up to date on GitHub."
else
  MSG="${1:-Update: $(date '+%Y-%m-%d %H:%M')}"
  echo "── Committing to GitHub ──────────────────────────────"
  git add -A
  git commit -m "$MSG"
  git push origin main
  echo "✓ Pushed to GitHub."
fi

echo "── Deploying to Quicksite ────────────────────────────"
quick deploy "$REPO_DIR" "$SITE_NAME" --force
echo ""
echo "✅ Done! Live at https://${SITE_NAME}.quick.shopify.io"
