# Deployment Guide

## GitHub Actions OIDC Setup for Google Cloud

This project uses GitHub Actions with Workload Identity Federation (OIDC) to deploy to Google Cloud Run without storing service account keys.

### Prerequisites

- Google Cloud Project with billing enabled
- GitHub repository with Actions enabled
- `gcloud` CLI installed and authenticated

### 1. Create Workload Identity Pool

```bash
# Set variables
export PROJECT_ID="indieout"
export POOL_NAME="github-actions-pool"
export PROVIDER_NAME="github-actions-provider"
export REPO="seuros/indieout-marketplace"  # Replace with your repo
export SERVICE_ACCOUNT_NAME="github-actions-sa"

# Create Workload Identity Pool
gcloud iam workload-identity-pools create $POOL_NAME \
    --project=$PROJECT_ID \
    --location="global" \
    --display-name="GitHub Actions Pool"

# Get the full pool name
export WORKLOAD_IDENTITY_POOL_ID=$(gcloud iam workload-identity-pools describe $POOL_NAME \
    --project=$PROJECT_ID \
    --location="global" \
    --format="value(name)")
```

### 2. Create OIDC Provider

```bash
# Create OIDC Provider for GitHub
gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
    --project=$PROJECT_ID \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --display-name="GitHub Actions Provider" \
    --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
    --issuer-uri="https://token.actions.githubusercontent.com"
```

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create $SERVICE_ACCOUNT_NAME \
    --project=$PROJECT_ID \
    --display-name="GitHub Actions Service Account"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:$SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### 4. Bind GitHub Repository to Workload Identity

```bash
# Allow GitHub Actions from your repository to impersonate the service account
gcloud iam service-accounts add-iam-policy-binding \
    $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com \
    --project=$PROJECT_ID \
    --role="roles/iam.workloadIdentityUser" \
    --member="principalSet://iam.googleapis.com/$WORKLOAD_IDENTITY_POOL_ID/attribute.repository/$REPO"
```

### 5. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

```bash
# Get the values to add as GitHub secrets
echo "WIF_PROVIDER: $WORKLOAD_IDENTITY_POOL_ID/providers/$PROVIDER_NAME"
echo "WIF_SERVICE_ACCOUNT: $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com"
```

**GitHub Secrets to add:**
- `WIF_PROVIDER`: The full Workload Identity Provider path
- `WIF_SERVICE_ACCOUNT`: The service account email
- `RAILS_MASTER_KEY`: Your Rails master key
- `DB_PASSWORD`: Database password
- `GCS_BUCKET`: Google Cloud Storage bucket name

### 6. Test the Setup

Push to the main branch and verify the GitHub Actions workflow runs successfully with OIDC authentication.

### Troubleshooting

#### Authentication Issues
- Verify the Workload Identity Pool and Provider are created correctly
- Check that the service account has the necessary IAM roles
- Ensure the GitHub repository path matches exactly in the binding

#### Permissions Issues
- Verify service account has Cloud Run Admin, Service Account User, and Cloud Build Editor roles
- Check that Cloud Run API and Cloud Build API are enabled in your project

#### GitHub Actions Issues
- Ensure `id-token: write` permission is set in the workflow
- Verify the GitHub secrets are set correctly
- Check the Actions logs for specific error messages

### Security Benefits

- **No stored keys**: Service account keys are not stored in GitHub secrets
- **Short-lived tokens**: OIDC tokens are automatically rotated
- **Repository-specific**: Only your specific GitHub repository can authenticate
- **Auditable**: All authentication attempts are logged in Google Cloud

### Cleanup (if needed)

```bash
# Delete the Workload Identity setup
gcloud iam workload-identity-pools delete $POOL_NAME \
    --project=$PROJECT_ID \
    --location="global"

# Delete the service account
gcloud iam service-accounts delete \
    $SERVICE_ACCOUNT_NAME@$PROJECT_ID.iam.gserviceaccount.com \
    --project=$PROJECT_ID
```

---

*Captain seuros 🚀*