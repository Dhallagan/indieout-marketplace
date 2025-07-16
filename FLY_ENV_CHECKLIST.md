# Fly.io Environment Variables Checklist

This document lists all environment variables required for the indieout Rails API deployment on Fly.io.

## Required Environment Variables

### Core Rails Configuration
- [ ] `RAILS_MASTER_KEY` - Rails master key from `api/config/master.key`
- [ ] `DATABASE_URL` - Automatically set by Fly.io when Postgres is attached
- [ ] `RAILS_HOST` - The public URL of the Rails API (e.g., `https://indieout.fly.dev`)

### Storage Configuration (Tigris S3-compatible)
- [ ] `AWS_ACCESS_KEY_ID` - Tigris access key (from `fly storage list`)
- [ ] `AWS_SECRET_ACCESS_KEY` - Tigris secret key (from `fly storage list`)
- [ ] `BUCKET_NAME` - Tigris bucket name (e.g., `indieout-storage`)
- [ ] `AWS_ENDPOINT_URL_S3` - Set to `https://fly.storage.tigris.dev`
- [ ] `AWS_REGION` - Set to `auto`

### Authentication & Security
- [ ] `JWT_SECRET` - Secret key for JWT token generation (generate with `openssl rand -hex 32`)
- [ ] `ALLOWED_ORIGINS` - CORS allowed origins (e.g., `https://indieout-web.fly.dev`)

### Optional: Email Configuration
- [ ] `SMTP_ADDRESS` - SMTP server address
- [ ] `SMTP_PORT` - SMTP port (default: 587)
- [ ] `SMTP_USERNAME` - SMTP username
- [ ] `SMTP_PASSWORD` - SMTP password
- [ ] `SMTP_FROM_EMAIL` - Default from email address

### Optional: CDN Configuration
- [ ] `CDN_HOST` - CDN hostname for serving static assets (if using a CDN)

## Quick Setup Commands

### 1. Create Tigris Storage
```bash
fly storage create --name indieout-storage --org personal
fly storage list  # Copy the access keys
```

### 2. Set All Secrets (Interactive)
```bash
./set-fly-secrets.sh
```

### 3. Set Secrets Manually
```bash
fly secrets set \
  RAILS_MASTER_KEY=<your-master-key> \
  RAILS_HOST=https://indieout.fly.dev \
  AWS_ACCESS_KEY_ID=<tigris-access-key> \
  AWS_SECRET_ACCESS_KEY=<tigris-secret-key> \
  BUCKET_NAME=indieout-storage \
  AWS_ENDPOINT_URL_S3=https://fly.storage.tigris.dev \
  AWS_REGION=auto \
  JWT_SECRET=<generated-jwt-secret> \
  ALLOWED_ORIGINS=https://indieout-web.fly.dev \
  --app indieout
```

### 4. Verify Secrets
```bash
fly secrets list --app indieout
```

## Environment Variables Set in fly.toml
These are already configured in the fly.toml file:
- `PORT=3000`
- `RAILS_ENV=production`
- `RAILS_LOG_TO_STDOUT=enabled`
- `RAILS_SERVE_STATIC_FILES=true`

## Notes
- The `DATABASE_URL` is automatically set when you attach a Postgres database
- Generate secure secrets with: `openssl rand -hex 32`
- For local development, create a `.env` file in the `api` directory
- Never commit secrets to version control