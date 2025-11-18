#!/usr/bin/env bash
# Script to update all dependencies to latest versions
# Usage: bun run scripts/update-deps.sh

set -e

echo "🔄 Checking for outdated dependencies..."

# Update all dependencies to latest
bun update --latest

# Check what's outdated after update
echo ""
echo "📊 Checking remaining outdated packages..."
bun outdated || echo "✅ All dependencies are up to date!"

echo ""
echo "✨ Done! Run 'bun install' to ensure lockfile is updated."
echo "💡 Remember to test your changes after updating dependencies."

