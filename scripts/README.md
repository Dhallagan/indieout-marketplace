# Scripts Directory

This directory contains utility scripts for development, testing, and deployment.

## Scripts Overview

### Deployment Scripts
- **`deploy-monorepo.sh`** - Deploy the entire monorepo to Fly.io as a single app
- **`deploy-api.sh`** - Deploy only the Rails API to Fly.io (if using separate apps)
- **`deploy-client.sh`** - Deploy only the React frontend to Fly.io (if using separate apps)
- **`set-fly-secrets.sh`** - Interactive script to set Fly.io environment variables
- **`set-tigris-secrets.sh`** - Set Tigris storage credentials for Fly.io

### Testing Scripts
- **`test-local-docker.sh`** - Test the app locally using Docker Compose
- **`test-local-simple.sh`** - Test the app locally without Docker (uses system PostgreSQL)
- **`run-rails-tests.sh`** - Run the Rails test suite

### Utility Scripts
- **`generate-types.js`** - Generate TypeScript types from Rails API serializers
- **`setup-tigris.sh`** - Set up Tigris storage bucket on Fly.io
- **`cleanup-structure.sh`** - Clean up duplicate files and organize project structure

## Usage

All scripts should be run from the project root directory:

```bash
# Make scripts executable (first time only)
chmod +x scripts/*.sh

# Run a script
./scripts/deploy-monorepo.sh
```

## Configuration Files Location

Main configuration files are kept in the project root following best practices:
- `Dockerfile` - Production build configuration
- `docker-compose.yml` - Local development environment
- `fly.toml` - Fly.io deployment configuration
- `.dockerignore` - Files to exclude from Docker builds