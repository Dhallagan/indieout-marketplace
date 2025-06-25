#!/bin/bash

# Setup Cloud SQL for IndieOut Marketplace

set -e

echo "🗄️ Setting up Cloud SQL for IndieOut..."

PROJECT_ID="indieout"
REGION="us-central1"
INSTANCE_NAME="indieout-db"
DB_NAME="indieout_production"
DB_USER="indieout"

# Create Cloud SQL instance
echo "Creating Cloud SQL instance (this may take several minutes)..."
gcloud sql instances create $INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --network=default \
    --no-assign-ip \
    --database-flags=max_connections=100 \
    --quiet || echo "Instance may already exist"

# Wait for instance to be ready
echo "Waiting for instance to be ready..."
gcloud sql operations wait --project=$PROJECT_ID \
    $(gcloud sql operations list --instance=$INSTANCE_NAME --filter='status!=DONE' --format='value(name)' --limit=1) \
    || true

# Create database
echo "Creating database..."
gcloud sql databases create $DB_NAME \
    --instance=$INSTANCE_NAME \
    --quiet || echo "Database may already exist"

# Generate a secure password
DB_PASSWORD=$(openssl rand -base64 32)

# Create user
echo "Creating database user..."
gcloud sql users create $DB_USER \
    --instance=$INSTANCE_NAME \
    --password=$DB_PASSWORD \
    --quiet || echo "User may already exist"

# Get connection name
CONNECTION_NAME=$(gcloud sql instances describe $INSTANCE_NAME --format="value(connectionName)")

# Create database URL secret
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME?host=/cloudsql/$CONNECTION_NAME"

echo "Creating database URL secret..."
echo -n "$DATABASE_URL" | gcloud secrets create database-url --data-file=- || \
echo -n "$DATABASE_URL" | gcloud secrets versions add database-url --data-file=-

# Grant service account access to secrets
SA_EMAIL="github-actions@$PROJECT_ID.iam.gserviceaccount.com"
gcloud secrets add-iam-policy-binding database-url \
    --member="serviceAccount:$SA_EMAIL" \
    --role="roles/secretmanager.secretAccessor" \
    --quiet

echo ""
echo "✅ Cloud SQL setup complete!"
echo ""
echo "Connection details:"
echo "==================="
echo "Instance: $INSTANCE_NAME"
echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Connection Name: $CONNECTION_NAME"
echo ""
echo "Add this to your GitHub secrets:"
echo "CLOUD_SQL_CONNECTION: $CONNECTION_NAME"
echo ""
echo "The database URL has been stored in Google Secret Manager as 'database-url'"