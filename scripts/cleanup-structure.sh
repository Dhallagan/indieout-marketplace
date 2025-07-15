#!/bin/bash

# Cleanup script to organize files according to best practices
set -e

echo "🧹 Cleaning up project structure..."

# Change to project root
cd "$(dirname "$0")/.."

# Remove duplicate files from root
echo "Removing duplicate test scripts from root..."
rm -f test-local-docker.sh test-local-simple.sh

# Remove old deployment script from root (now in scripts)
echo "Removing old deployment script from root..."
rm -f deploy-monorepo.sh

# Remove unnecessary docker subdirectory
echo "Removing scripts/docker subdirectory..."
rm -rf scripts/docker

echo "✅ Cleanup complete!"
echo ""
echo "Current structure follows best practices:"
echo "  Root directory:"
echo "    - Dockerfile (production build)"
echo "    - docker-compose.yml (local development)"  
echo "    - fly.toml (Fly.io config)"
echo "    - .dockerignore"
echo ""
echo "  Scripts directory:"
echo "    - deploy-monorepo.sh"
echo "    - test-local-docker.sh"
echo "    - test-local-simple.sh"
echo "    - Other utility scripts"