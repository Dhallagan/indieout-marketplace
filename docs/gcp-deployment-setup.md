# Google Cloud Platform Deployment Setup Guide

This guide walks through setting up your Rails application for deployment on Google Cloud Run.

## Prerequisites

1. Google Cloud Project with billing enabled
2. gcloud CLI installed locally
3. Docker installed locally
4. Rails master key available

## Initial Setup

### 1. Set Project and Region

```bash
export PROJECT_ID="your-project-id"
export REGION="us-central1"
gcloud config set project $PROJECT_ID
```

### 2. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com \
  artifactregistry.googleapis.com
```

### 3. Create Artifact Registry Repository

```bash
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=$REGION \
  --description="Docker repository for Cloud Run deployments"
```

### 4. Create Cloud SQL Instance

```bash
# Create PostgreSQL instance
gcloud sql instances create indieout-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=$REGION

# Create database
gcloud sql databases create indieout_production \
  --instance=indieout-db

# Create database user
gcloud sql users create rails_user \
  --instance=indieout-db \
  --password=your-secure-password
```

### 5. Store Secrets in Secret Manager

```bash
# Store Rails master key
gcloud secrets create rails-master-key \
  --data-file=./api/config/master.key

# Store database URL (replace with your actual values)
echo "postgresql://rails_user:your-secure-password@/indieout_production?host=/cloudsql/$PROJECT_ID:$REGION:indieout-db" | \
  gcloud secrets create database-url --data-file=-

# Grant Cloud Run access to secrets
gcloud secrets add-iam-policy-binding rails-master-key \
  --member="serviceAccount:$PROJECT_ID-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding database-url \
  --member="serviceAccount:$PROJECT_ID-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# Grant Cloud Build access to secrets
gcloud secrets add-iam-policy-binding rails-master-key \
  --member="serviceAccount:$PROJECT_ID@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6. Grant Cloud Build Permissions

```bash
# Get the Cloud Build service account
export CLOUDBUILD_SA="$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')@cloudbuild.gserviceaccount.com"

# Grant Cloud Run Admin role
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUDBUILD_SA" \
  --role="roles/run.admin"

# Grant Service Account User role
gcloud iam service-accounts add-iam-policy-binding \
  $PROJECT_ID-compute@developer.gserviceaccount.com \
  --member="serviceAccount:$CLOUDBUILD_SA" \
  --role="roles/iam.serviceAccountUser"

# Grant Secret Manager access
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$CLOUDBUILD_SA" \
  --role="roles/secretmanager.secretAccessor"
```

## GitHub Actions Setup

Add the following secrets to your GitHub repository:

1. **GCP_PROJECT_ID**: Your Google Cloud project ID
2. **GCP_SA_KEY**: Service account key with necessary permissions

### Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
  --display-name="GitHub Actions Deploy"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.viewer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-actions@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectAdmin"

# Create and download key
gcloud iam service-accounts keys create github-actions-key.json \
  --iam-account=github-actions@$PROJECT_ID.iam.gserviceaccount.com

# Add the contents of github-actions-key.json as GCP_SA_KEY secret in GitHub
```

## Local Development

### Test Cloud Build Locally

```bash
# Build locally
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=COMMIT_SHA=local,SHORT_SHA=local,BRANCH_NAME=local
```

### Connect to Cloud SQL from Local

```bash
# Install Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.arm64
chmod +x cloud-sql-proxy

# Run proxy
./cloud-sql-proxy --port 5432 $PROJECT_ID:$REGION:indieout-db
```

## Monitoring and Debugging

### View Cloud Run Logs

```bash
gcloud run services logs read indieout-api --region=$REGION
```

### View Cloud Build History

```bash
gcloud builds list --limit=10
```

### SSH into Cloud SQL

```bash
gcloud sql connect indieout-db --user=rails_user --database=indieout_production
```

## Deployment

Push to main branch to trigger automatic deployment via GitHub Actions, or manually trigger:

```bash
# Manual deployment
gcloud builds submit --config=cloudbuild.yaml
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service=indieout-api --region=$REGION

# Rollback to previous revision
gcloud run services update-traffic indieout-api \
  --to-revisions=REVISION_NAME=100 \
  --region=$REGION
```