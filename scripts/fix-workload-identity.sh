#!/bin/bash

# Fix Workload Identity Federation for correct GitHub repository

set -e

echo "Fixing Workload Identity Federation configuration..."

PROJECT_ID="indieout"
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"
GITHUB_ORG="Dhallagan"  # Correct case
GITHUB_REPO="indieout-marketplace"

# Delete existing provider
echo "Removing existing provider..."
gcloud iam workload-identity-pools providers delete $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --quiet || true

# Wait a moment for deletion to complete
sleep 5

# Recreate provider with correct attribute condition
echo "Creating provider with correct GitHub repository..."
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-condition="assertion.repository=='$GITHUB_ORG/$GITHUB_REPO'" \
    --quiet

echo "Provider recreated with repository: $GITHUB_ORG/$GITHUB_REPO"

# Get the WIP value for GitHub secrets
WIP=$(gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --format="value(name)")

echo ""
echo "Update your GitHub secret WIP with this value:"
echo "$WIP"