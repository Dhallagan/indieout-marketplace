# Google Cloud Platform Deployment Guide

This guide covers deploying the IndieOut marketplace to Google Cloud Platform using Cloud Run, Cloud SQL, and Cloud Storage.

## Architecture Overview

- **Backend API**: Cloud Run (serverless containers)
- **Database**: Cloud SQL (PostgreSQL)
- **Frontend**: Cloud Storage + Cloud CDN
- **CI/CD**: GitHub Actions + Cloud Build
- **Secrets**: Secret Manager
- **Container Registry**: Artifact Registry
- **Infrastructure**: Terraform

## Prerequisites

1. **Google Cloud Account** with billing enabled
2. **gcloud CLI** installed ([installation guide](https://cloud.google.com/sdk/docs/install))
3. **Terraform** installed (optional, for infrastructure as code)
4. **GitHub repository** with admin access
5. **Domain name** (for production deployment)

## Quick Start

### 1. Run Setup Script

```bash
# Run the automated setup script
./scripts/setup-gcp.sh
```

This script will:
- Enable required GCP APIs
- Create service accounts
- Set up Workload Identity Federation
- Create Artifact Registry
- Initialize secrets
- Provide configuration values

### 2. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings > Secrets and variables > Actions):

- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SA_EMAIL`: Service account email (provided by setup script)
- `WIP`: Workload Identity Provider (provided by setup script)
- `STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key (optional)
- `SLACK_WEBHOOK`: Slack webhook URL for notifications (optional)

### 3. Deploy Infrastructure with Terraform

```bash
# Navigate to Terraform directory
cd terraform/gcp

# Create variables file
cat > terraform.tfvars <<EOF
project_id   = "your-project-id"
github_owner = "your-github-username"
github_repo  = "indieout"
domains      = ["yourdomain.com", "www.yourdomain.com"]
EOF

# Initialize and apply
terraform init
terraform plan
terraform apply
```

### 4. Configure Secrets in Secret Manager

Update the secret values in GCP Secret Manager:

```bash
# Rails master key
cat api/config/master.key | gcloud secrets versions add rails-master-key --data-file=-

# Generate JWT secret
openssl rand -base64 32 | gcloud secrets versions add jwt-secret-key --data-file=-

# Add SMTP password
echo -n "your-smtp-password" | gcloud secrets versions add smtp-password --data-file=-

# Add Stripe secret key
echo -n "sk_live_xxx" | gcloud secrets versions add stripe-secret-key --data-file=-
```

### 5. Deploy Application

Push to the main branch to trigger automatic deployment:

```bash
git add .
git commit -m "Deploy to GCP"
git push origin main
```

## Manual Deployment

### Deploy Backend API

```bash
# Build and push Docker image
cd api
docker build -t us-central1-docker.pkg.dev/PROJECT_ID/indieout/api:latest .
docker push us-central1-docker.pkg.dev/PROJECT_ID/indieout/api:latest

# Deploy to Cloud Run
gcloud run deploy indieout-api \
  --image us-central1-docker.pkg.dev/PROJECT_ID/indieout/api:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:us-central1:indieout-db \
  --set-secrets DATABASE_URL=database-url:latest \
  --set-secrets RAILS_MASTER_KEY=rails-master-key:latest
```

### Deploy Frontend

```bash
# Build frontend
cd client
VITE_API_URL=https://indieout-api-PROJECT_ID.a.run.app npm run build

# Upload to Cloud Storage
gsutil -m rsync -r -d dist/ gs://indieout-frontend-PROJECT_ID/

# Set cache headers
gsutil -m setmeta -h "Cache-Control:no-cache" gs://indieout-frontend-PROJECT_ID/index.html
```

## Environment Configuration

### Backend Environment Variables

Set in Cloud Run or via secrets:

```bash
RAILS_ENV=production
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true
DATABASE_URL=postgresql://user:pass@/dbname?host=/cloudsql/connection-name
RAILS_MASTER_KEY=your-master-key
JWT_SECRET_KEY=your-jwt-secret
FRONTEND_URL=https://yourdomain.com
```

### Frontend Environment Variables

Set during build:

```bash
VITE_API_URL=https://api-PROJECT_ID.a.run.app
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## Database Management

### Connect to Cloud SQL

```bash
# Using Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE_NAME=tcp:5432

# Connect with psql
psql -h localhost -U indieout -d indieout_production
```

### Run Migrations

```bash
# Via Cloud Run Jobs
gcloud run jobs execute migrate-db --region us-central1

# Or locally with proxy
RAILS_ENV=production rails db:migrate
```

### Backup Database

```bash
# Create on-demand backup
gcloud sql backups create --instance=indieout-db

# List backups
gcloud sql backups list --instance=indieout-db
```

## Monitoring and Debugging

### View Logs

```bash
# Cloud Run logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=indieout-api" --limit 50

# Cloud SQL logs
gcloud logging read "resource.type=cloudsql_database" --limit 50
```

### View Metrics

```bash
# Open Cloud Console monitoring
gcloud app browse --project=PROJECT_ID
```

### SSH into Cloud Run (for debugging)

```bash
# Not directly possible, but you can run a debug container
gcloud run services update indieout-api --command="/bin/bash" --args="-c","sleep 3600"
```

## Custom Domain Setup

### 1. Create SSL Certificate

```bash
# Managed certificate (automatic)
gcloud compute ssl-certificates create indieout-cert \
  --domains=yourdomain.com,www.yourdomain.com \
  --global
```

### 2. Update DNS Records

Add these records to your domain:

```
Type  Name    Value
A     @       LOAD_BALANCER_IP
A     www     LOAD_BALANCER_IP
```

### 3. Verify Domain

```bash
# Check certificate status
gcloud compute ssl-certificates describe indieout-cert --global
```

## Cost Optimization

### 1. Set Resource Limits

```yaml
# In Cloud Run configuration
resources:
  limits:
    cpu: "1"
    memory: "1Gi"
```

### 2. Configure Autoscaling

```bash
gcloud run services update indieout-api \
  --min-instances=0 \
  --max-instances=10 \
  --concurrency=80
```

### 3. Enable Cloud CDN

Already configured in Terraform for frontend assets.

### 4. Schedule Cloud SQL

```bash
# Stop during off-hours (development only)
gcloud sql instances patch indieout-db --no-backup
```

## Security Best Practices

### 1. Enable Security Scanning

```bash
# Enable vulnerability scanning
gcloud container images scan IMAGE_URL
```

### 2. Restrict Cloud Run Access

```bash
# Require authentication
gcloud run services update indieout-api --no-allow-unauthenticated
```

### 3. Use VPC Connector

```bash
# Create VPC connector for private Cloud SQL access
gcloud compute networks vpc-access connectors create indieout-connector \
  --region=us-central1 \
  --subnet=cloudrun-subnet
```

### 4. Enable Cloud Armor

```bash
# Protect against DDoS
gcloud compute security-policies create indieout-policy \
  --description="Security policy for IndieOut"
```

## Troubleshooting

### Cloud Run Won't Start

1. Check logs: `gcloud logging read`
2. Verify secrets are set correctly
3. Ensure Cloud SQL is accessible
4. Check resource limits

### Database Connection Failed

1. Verify Cloud SQL instance is running
2. Check connection string format
3. Ensure Cloud SQL Admin API is enabled
4. Verify service account permissions

### Frontend Not Loading

1. Check bucket permissions (should be public)
2. Verify CDN configuration
3. Check CORS settings
4. Inspect browser console for errors

### High Costs

1. Review Cloud Run metrics
2. Check for unnecessary Cloud SQL backups
3. Verify CDN is caching properly
4. Set up budget alerts

## Rollback Procedure

### Rollback Cloud Run

```bash
# List revisions
gcloud run revisions list --service=indieout-api

# Route traffic to previous revision
gcloud run services update-traffic indieout-api \
  --to-revisions=PREVIOUS_REVISION=100
```

### Restore Database

```bash
# List backups
gcloud sql backups list --instance=indieout-db

# Restore from backup
gcloud sql backups restore BACKUP_ID --restore-instance=indieout-db
```

## Maintenance

### Update Dependencies

```bash
# Update Ruby gems
cd api && bundle update

# Update npm packages
cd client && npm update

# Rebuild and deploy
git push origin main
```

### Scale Resources

```bash
# Scale Cloud SQL
gcloud sql instances patch indieout-db --tier=db-n1-standard-2

# Scale Cloud Run
gcloud run services update indieout-api --memory=2Gi --cpu=2
```

## Support

For issues specific to GCP deployment:
1. Check GCP Status: https://status.cloud.google.com/
2. Review logs in Cloud Console
3. Contact GCP Support (if you have a support plan)

For application issues:
1. Check application logs
2. Review error tracking (if configured)
3. Submit issue on GitHub