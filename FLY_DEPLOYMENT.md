# Fly.io Deployment Guide

This guide walks you through deploying IndieOut marketplace on Fly.io.

## Prerequisites

1. Install Fly CLI:
```bash
# macOS
brew install flyctl

# Or use curl
curl -L https://fly.io/install.sh | sh
```

2. Sign up and login:
```bash
fly auth signup
# or
fly auth login
```

## Step 1: Deploy Rails API

```bash
cd api

# Launch the app (first time only)
fly launch --no-deploy

# When prompted:
# - App name: indieout-api
# - Region: Choose closest to you (e.g., iad for US East)
# - Postgres: YES
# - Redis: YES
```

### Set Rails Master Key

```bash
# Get your Rails master key
cat config/master.key

# Set it as a secret
fly secrets set RAILS_MASTER_KEY=your-key-here
```

### Set Other Secrets

```bash
fly secrets set \
  JWT_SECRET_KEY="$(openssl rand -base64 32)" \
  SECRET_KEY_BASE="$(openssl rand -base64 32)" \
  FRONTEND_URL="https://indieout-frontend.fly.dev"
```

### Deploy API

```bash
fly deploy
```

### Verify API

```bash
fly open
# Should see Rails welcome or health check
```

## Step 2: Deploy React Frontend

```bash
cd ../client

# Launch the app
fly launch --no-deploy

# When prompted:
# - App name: indieout-frontend
# - Region: Same as API
# - Postgres: NO
# - Redis: NO
```

### Update API URL

Edit `client/fly.toml` and update the build arg:
```toml
[build.args]
  VITE_API_URL = "https://indieout-api.fly.dev"
```

### Deploy Frontend

```bash
fly deploy
```

## Step 3: Configure Custom Domains (Optional)

### For API

```bash
cd api
fly ips allocate-v4
fly certs add api.yourdomain.com
```

### For Frontend

```bash
cd ../client
fly ips allocate-v4
fly certs add yourdomain.com
fly certs add www.yourdomain.com
```

### DNS Configuration

Add these DNS records:
- A record: `@` → Your frontend IPv4
- A record: `www` → Your frontend IPv4
- A record: `api` → Your API IPv4

## Step 4: Scale Applications

### Scale API

```bash
cd api
# Add more instances in different regions
fly scale count 2 --region iad,sea

# Scale machine size
fly scale vm shared-cpu-2x
```

### Scale Frontend

```bash
cd ../client
fly scale count 2 --region iad,sea
```

## Database Management

### Access Rails Console

```bash
cd api
fly ssh console
cd /app
bundle exec rails console
```

### Database Migrations

Migrations run automatically on deploy via release_command.
To run manually:

```bash
fly ssh console
cd /app
bundle exec rails db:migrate
```

### Database Backups

```bash
# Create backup
fly postgres backup create

# List backups
fly postgres backup list

# Restore from backup
fly postgres backup restore <backup-id>
```

## Monitoring

### View Logs

```bash
# API logs
cd api && fly logs

# Frontend logs
cd client && fly logs
```

### Check Status

```bash
fly status
fly checks list
```

### SSH into Machines

```bash
fly ssh console
```

## Environment Variables

### Update API Environment

```bash
cd api
fly secrets list
fly secrets set KEY=value
```

### Update Frontend Build Args

Edit `client/fly.toml` and redeploy:
```bash
cd client
fly deploy
```

## Useful Commands

```bash
# Restart app
fly apps restart

# Check app info
fly info

# Open app in browser
fly open

# Check regions
fly regions list

# View metrics
fly metrics

# Scale to zero (save money)
fly scale count 0
```

## Troubleshooting

### API Issues

1. Check logs: `fly logs`
2. Check secrets: `fly secrets list`
3. SSH in: `fly ssh console`
4. Check health: `curl https://indieout-api.fly.dev/health`

### Frontend Issues

1. Verify API URL in fly.toml
2. Check build logs during deploy
3. Verify nginx is running: `fly ssh console -C "ps aux | grep nginx"`

### Database Connection Issues

```bash
# Check database status
fly postgres status

# Get connection string
fly postgres config show

# Connect directly
fly postgres connect
```

## Cost Optimization

- Use `fly scale count 0` during development
- Frontend can use smallest machine size
- API can start with `shared-cpu-1x`
- Use Fly's free tier allowances

## Production Checklist

- [ ] Set all required secrets
- [ ] Configure custom domains
- [ ] Set up database backups
- [ ] Configure monitoring alerts
- [ ] Test health endpoints
- [ ] Scale appropriately
- [ ] Set up CI/CD (optional)