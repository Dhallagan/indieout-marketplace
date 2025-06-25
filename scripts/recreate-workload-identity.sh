#!/bin/bash

# Recreate Workload Identity Federation with correct settings

set -e

echo "Recreating Workload Identity Federation..."

PROJECT_ID="indieout"
PROJECT_NUMBER="400186155831"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
SA_NAME="github-actions"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
GITHUB_ORG="Dhallagan"
GITHUB_REPO="indieout-marketplace"

# Wait for any pending deletions
echo "Waiting for any pending deletions..."
sleep 10

# Create a new provider (use a different name if the old one is still being deleted)
PROVIDER_NAME="github-provider-v2"
echo "Creating new provider: $PROVIDER_NAME"

gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --display-name="GitHub Provider V2" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-condition="assertion.repository=='$GITHUB_ORG/$GITHUB_REPO'" \
    --quiet

echo "Provider created with repository: $GITHUB_ORG/$GITHUB_REPO"

# Update the service account binding
PRINCIPAL="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$GITHUB_ORG/$GITHUB_REPO"

echo "Updating service account binding..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
    --role="roles/iam.workloadIdentityUser" \
    --member="$PRINCIPAL" \
    --quiet

# Get the new WIP value
WIP="projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/providers/$PROVIDER_NAME"

echo ""
echo "==================================="
echo "GitHub Secrets to Update:"
echo "==================================="
echo "WIP: $WIP"
echo "GCP_SA_EMAIL: $SA_EMAIL"
echo "GCP_PROJECT_ID: $PROJECT_ID"
echo "==================================="