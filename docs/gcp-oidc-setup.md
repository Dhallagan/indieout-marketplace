# GCP OIDC Setup Guide for GitHub Actions

This guide walks you through setting up Workload Identity Federation (WIF) to allow GitHub Actions to securely deploy to Google Cloud Run without using service account keys.

## Prerequisites

- Google Cloud CLI (`gcloud`) installed and authenticated
- A GCP project with billing enabled
- GitHub repository where you want to set up deployment
- (Optional) GitHub CLI (`gh`) for setting secrets

## Step 1: Set Environment Variables

```bash
# Set your configuration
export PROJECT_ID="your-gcp-project-id"
export GITHUB_ORG="your-github-username-or-org"
export GITHUB_REPO="your-repo-name"
export REGION="us-central1"  # or your preferred region
export SERVICE_NAME="indieout-marketplace"  # your Cloud Run service name

# These will be created
export POOL_NAME="github-pool"
export PROVIDER_NAME="github-provider"
export SERVICE_ACCOUNT_NAME="github-actions-sa"
export SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
```

## Step 2: Enable Required APIs

```bash
gcloud config set project $PROJECT_ID

gcloud services enable \
    cloudresourcemanager.googleapis.com \
    iamcredentials.googleapis.com \
    sts.googleapis.com \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com
```

## Step 3: Create Workload Identity Pool

```bash
gcloud iam workload-identity-pools create $POOL_NAME \
    --location=global \
    --display-name="GitHub Actions Pool" \
    --description="Pool for GitHub Actions OIDC"
```

## Step 4: Create Workload Identity Provider

```bash
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --location=global \
    --workload-identity-pool=$POOL_NAME \
    --display-name="GitHub Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository_owner == '${GITHUB_ORG}'" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

## Step 5: Create Service Account

```bash
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --display-name="GitHub Actions Service Account" \
    --description="Service account for GitHub Actions deployments"
```

## Step 6: Grant Permissions to Service Account

```bash
# Core permissions needed for Cloud Run deployment
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/viewer"

# If using Cloud SQL, also add:
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_EMAIL" \
    --role="roles/cloudsql.client"
```

## Step 7: Get Project Number

```bash
export PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
echo "Project Number: $PROJECT_NUMBER"
```

## Step 8: Bind GitHub Repository to Workload Identity Pool

```bash
gcloud iam service-accounts add-iam-policy-binding $SERVICE_ACCOUNT_EMAIL \
    --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/attribute.repository/${GITHUB_ORG}/${GITHUB_REPO}" \
    --role="roles/iam.workloadIdentityUser"
```

## Step 9: Get Configuration Values

```bash
# Generate the WIF provider string
export WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_NAME}/providers/${PROVIDER_NAME}"

echo "========================================"
echo "GitHub Secrets to set:"
echo "========================================"
echo "WIF_PROVIDER:"
echo "$WIF_PROVIDER"
echo ""
echo "WIF_SERVICE_ACCOUNT:"
echo "$SERVICE_ACCOUNT_EMAIL"
echo ""
echo "GCP_PROJECT_ID:"
echo "$PROJECT_ID"
echo ""
echo "GCP_REGION:"
echo "$REGION"
echo ""
echo "GCP_SERVICE:"
echo "$SERVICE_NAME"
echo "========================================"
```

## Step 10: Set GitHub Secrets

### Option A: Using GitHub CLI

```bash
gh secret set WIF_PROVIDER --body "$WIF_PROVIDER" --repo "$GITHUB_ORG/$GITHUB_REPO"
gh secret set WIF_SERVICE_ACCOUNT --body "$SERVICE_ACCOUNT_EMAIL" --repo "$GITHUB_ORG/$GITHUB_REPO"
gh secret set GCP_PROJECT_ID --body "$PROJECT_ID" --repo "$GITHUB_ORG/$GITHUB_REPO"
gh secret set GCP_REGION --body "$REGION" --repo "$GITHUB_ORG/$GITHUB_REPO"
gh secret set GCP_SERVICE --body "$SERVICE_NAME" --repo "$GITHUB_ORG/$GITHUB_REPO"
```

### Option B: Using GitHub Web UI

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the values from Step 9

## Verification

After setup, your GitHub Actions workflow can authenticate using:

```yaml
- name: Authenticate to Google Cloud
  uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: ${{ secrets.WIF_PROVIDER }}
    service_account: ${{ secrets.WIF_SERVICE_ACCOUNT }}
```

## Troubleshooting

### Common Issues

1. **"Permission denied" errors during deployment**
   - Ensure all required roles are granted to the service account
   - Check that the repository binding includes the correct GitHub org/repo

2. **"Workload identity pool does not exist"**
   - Verify the pool was created successfully
   - Check that you're using the correct project

3. **Authentication failures in GitHub Actions**
   - Ensure the attribute condition matches your GitHub organization
   - Verify all secrets are set correctly in GitHub

### Cleanup (if needed)

To remove all created resources:

```bash
# Delete service account
gcloud iam service-accounts delete $SERVICE_ACCOUNT_EMAIL

# Delete provider
gcloud iam workload-identity-pools providers delete $PROVIDER_NAME \
    --workload-identity-pool=$POOL_NAME \
    --location=global

# Delete pool
gcloud iam workload-identity-pools delete $POOL_NAME \
    --location=global
```

## Additional Resources

- [Google Cloud Workload Identity Federation](https://cloud.google.com/iam/docs/workload-identity-federation)
- [GitHub Actions OIDC](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [google-github-actions/auth](https://github.com/google-github-actions/auth)