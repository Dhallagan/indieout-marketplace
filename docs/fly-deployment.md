# Fly.io Deployment Guide

This guide walks through deploying the Outdoor Marketplace application to Fly.io with Postgres database and persistent storage.

## Prerequisites

1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Create Fly.io account: `fly auth signup`
3. Login to Fly.io: `fly auth login`

## Initial Setup

### 1. Update App Names

Replace `indieout` and `indieout-web` in all configuration files with your actual app names:

- `api/fly.toml`
- `client/fly.toml`
- `deploy-api.sh`
- `deploy-client.sh`

### 2. Rails Master Key

Ensure your Rails master key is available. Find it in `api/config/master.key` or create one:

```bash
cd api
EDITOR="vim" rails credentials:edit
```

## Deployment Steps

### Deploy Rails API

1. Set up Tigris storage:
   ```bash
   ./setup-tigris.sh
   ```

2. Run the deployment script:
   ```bash
   ./deploy-api.sh
   ```

3. Set the Rails master key and storage credentials:
   ```bash
   fly secrets set \
     RAILS_MASTER_KEY=<your-master-key> \
     AWS_ACCESS_KEY_ID=<your-tigris-access-key> \
     AWS_SECRET_ACCESS_KEY=<your-tigris-secret-key> \
     AWS_BUCKET=indieout-storage \
     AWS_ENDPOINT=https://fly.storage.tigris.dev \
     AWS_REGION=auto \
     --app indieout
   ```

4. Verify the deployment:
   ```bash
   fly status --app indieout
   fly logs --app indieout
   ```

### Deploy React Client

1. Update the API URL in `deploy-client.sh` to match your deployed API URL

2. Run the deployment script:

   ```bash
   ./deploy-client.sh
   ```

3. Verify the deployment:
   ```bash
   fly status --app indieout-web
   fly logs --app indieout-web
   ```

## Environment Variables

### Rails API

Set additional environment variables as needed:

```bash
fly secrets set \
  JWT_SECRET=<your-jwt-secret> \
  SMTP_ADDRESS=<smtp-server> \
  SMTP_PORT=587 \
  SMTP_USERNAME=<username> \
  SMTP_PASSWORD=<password> \
  --app indieout
```

### React Client

The client uses build-time environment variables. Update `deploy-client.sh` to include any additional variables:

```bash
fly deploy --build-arg VITE_API_URL=https://your-api.fly.dev --build-arg VITE_OTHER_VAR=value
```

## Database Management

### Access Rails Console

```bash
fly ssh console --app indieout
cd /rails
bundle exec rails console
```

### Run Migrations

```bash
fly ssh console --app indieout -C "cd /rails && bundle exec rails db:migrate"
```

### Database Backups

```bash
fly postgres backup list --app indieout-db
fly postgres backup create --app indieout-db
```

## Storage Management

The Rails app uses a persistent volume mounted at `/rails/storage` for Active Storage files.

### Check Volume Status

```bash
fly volumes list --app indieout
```

### Resize Volume (if needed)

```bash
fly volumes extend <volume-id> --size 20
```

## Monitoring

### View Logs

```bash
# Rails API logs
fly logs --app indieout

# React Client logs
fly logs --app indieout-web
```

### Check App Status

```bash
fly status --app indieout
fly status --app indieout-web
```

### SSH into Containers

```bash
# Rails API
fly ssh console --app indieout

# React Client (nginx)
fly ssh console --app indieout-web
```

## Scaling

### Horizontal Scaling

```bash
# Scale Rails API to 3 instances
fly scale count 3 --app indieout

# Scale React Client to 2 instances
fly scale count 2 --app indieout-web
```

### Vertical Scaling

```bash
# Upgrade Rails API to 2GB RAM
fly scale vm shared-cpu-2x --app indieout
```

## Custom Domains

1. Add custom domain:

   ```bash
   fly certs add your-domain.com --app indieout-web
   ```

2. Update DNS records as instructed by Fly.io

3. Verify certificate:
   ```bash
   fly certs show your-domain.com --app indieout-web
   ```

## Troubleshooting

### Rails API Issues

1. Check logs: `fly logs --app indieout`
2. SSH in: `fly ssh console --app indieout`
3. Check Rails logs: `tail -f /rails/log/production.log`
4. Verify database connection: `cd /rails && bundle exec rails db:version`

### React Client Issues

1. Check build logs during deployment
2. Verify nginx configuration: `fly ssh console --app indieout-web -C "cat /etc/nginx/conf.d/default.conf"`
3. Check that API URL is correctly set in the build

### Common Issues

- **Database connection failed**: Ensure DATABASE_URL is set correctly
- **Assets not loading**: Check nginx configuration and build output
- **CORS errors**: Ensure Rails API allows requests from client domain
- **Storage not persisting**: Verify volume is mounted correctly

## Rollback

To rollback to a previous version:

```bash
# List releases
fly releases --app indieout

# Rollback to specific version
fly deploy --image registry.fly.io/indieout:v<number> --app indieout
```
