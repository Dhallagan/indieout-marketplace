#!/bin/bash

# Setup script for Google Cloud Platform deployment
# This script helps configure your GCP environment for IndieOut marketplace

set -e

echo "🚀 IndieOut GCP Setup Script"
echo "============================"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "📝 Please authenticate with Google Cloud:"
    gcloud auth login
fi

# Get or set project ID
if [ -z "$GCP_PROJECT_ID" ]; then
    echo ""
    echo "📋 Available projects:"
    gcloud projects list --format="table(projectId,name)"
    echo ""
    read -p "Enter your GCP Project ID: " GCP_PROJECT_ID
fi

# Set the project
gcloud config set project $GCP_PROJECT_ID
echo "✅ Using project: $GCP_PROJECT_ID"

# Enable required APIs
echo ""
echo "🔧 Enabling required APIs..."
apis=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "artifactregistry.googleapis.com"
    "sqladmin.googleapis.com"
    "compute.googleapis.com"
    "secretmanager.googleapis.com"
    "cloudresourcemanager.googleapis.com"
    "iam.googleapis.com"
    "monitoring.googleapis.com"
    "logging.googleapis.com"
    "servicenetworking.googleapis.com"
)

for api in "${apis[@]}"; do
    echo "  - Enabling $api..."
    gcloud services enable $api --quiet
done

# Create service account for GitHub Actions
echo ""
echo "🔑 Setting up service account for GitHub Actions..."
SA_NAME="github-actions"
SA_EMAIL="$SA_NAME@$GCP_PROJECT_ID.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $SA_EMAIL &> /dev/null; then
    gcloud iam service-accounts create $SA_NAME \
        --display-name="GitHub Actions Service Account"
fi

# Grant necessary roles
echo "  - Granting IAM roles..."
roles=(
    "roles/run.admin"
    "roles/storage.admin"
    "roles/cloudsql.admin"
    "roles/cloudbuild.builds.builder"
    "roles/secretmanager.admin"
    "roles/artifactregistry.admin"
    "roles/compute.admin"
    "roles/iam.serviceAccountUser"
)

for role in "${roles[@]}"; do
    gcloud projects add-iam-policy-binding $GCP_PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$role" \
        --quiet
done

# Set up Workload Identity Federation for GitHub Actions
echo ""
echo "🔐 Setting up Workload Identity Federation..."
POOL_NAME="github-pool"
PROVIDER_NAME="github-provider"

# Create workload identity pool
if ! gcloud iam workload-identity-pools describe $POOL_NAME --location="global" &> /dev/null; then
    echo "  - Creating workload identity pool..."
    gcloud iam workload-identity-pools create $POOL_NAME \
        --location="global" \
        --display-name="GitHub Actions Pool" \
        --quiet
else
    echo "  ✓ Workload identity pool already exists"
fi

# Create workload identity provider
read -p "Enter your GitHub username/organization: " GITHUB_ORG
read -p "Enter your GitHub repository name: " GITHUB_REPO

if ! gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME &> /dev/null; then
    echo "  - Creating identity provider..."
    gcloud iam workload-identity-pools providers create-oidc $PROVIDER_NAME \
        --location="global" \
        --workload-identity-pool=$POOL_NAME \
        --display-name="GitHub Provider" \
        --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository" \
        --issuer-uri="https://token.actions.githubusercontent.com" \
        --attribute-condition="assertion.repository=='$GITHUB_ORG/$GITHUB_REPO'" \
        --quiet
else
    echo "  ✓ Identity provider already exists"
fi

# Get Workload Identity Provider resource name
WIP=$(gcloud iam workload-identity-pools providers describe $PROVIDER_NAME \
    --location="global" \
    --workload-identity-pool=$POOL_NAME \
    --format="value(name)")

# Bind service account to workload identity
# Get project number
PROJECT_NUMBER=$(gcloud projects describe $GCP_PROJECT_ID --format="value(projectNumber)")

# Construct the correct principal member format
PRINCIPAL="principalSet://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$POOL_NAME/attribute.repository/$GITHUB_ORG/$GITHUB_REPO"

echo "  - Binding service account to workload identity..."
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL \
    --role="roles/iam.workloadIdentityUser" \
    --member="$PRINCIPAL" \
    --quiet

# Create Artifact Registry repository
echo ""
echo "📦 Creating Artifact Registry repository..."
gcloud artifacts repositories create indieout \
    --repository-format=docker \
    --location=us-central1 \
    --description="Docker images for IndieOut marketplace" \
    --quiet || true

# Create Cloud Storage bucket for Terraform state
echo ""
echo "🗄️ Creating bucket for Terraform state..."
gsutil mb -p $GCP_PROJECT_ID gs://$GCP_PROJECT_ID-terraform-state || true
gsutil versioning set on gs://$GCP_PROJECT_ID-terraform-state

# Create secrets
echo ""
echo "🔒 Setting up Secret Manager secrets..."
echo "  Please prepare the following values:"
echo "  - Rails master key (from api/config/master.key)"
echo "  - JWT secret key (generate with: openssl rand -base64 32)"
echo "  - SMTP password (from your email provider)"
echo "  - Stripe secret key (from Stripe dashboard)"
echo ""

# Function to create or update secret
create_secret() {
    secret_name=$1
    prompt=$2
    
    if gcloud secrets describe $secret_name &> /dev/null; then
        echo "  ✓ Secret '$secret_name' already exists"
    else
        read -s -p "  Enter $prompt: " secret_value
        echo ""
        echo -n "$secret_value" | gcloud secrets create $secret_name --data-file=-
        echo "  ✓ Created secret '$secret_name'"
    fi
}

create_secret "rails-master-key" "Rails master key"
create_secret "jwt-secret-key" "JWT secret key"
create_secret "smtp-password" "SMTP password"
create_secret "stripe-secret-key" "Stripe secret key"

# Output GitHub Actions secrets
echo ""
echo "📋 GitHub Actions Configuration"
echo "==============================="
echo ""
echo "Add these secrets to your GitHub repository:"
echo "(Settings > Secrets and variables > Actions)"
echo ""
echo "GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo "GCP_SA_EMAIL: $SA_EMAIL"
echo "WIP: $WIP"
echo ""

# Output Terraform variables
echo "📋 Terraform Configuration"
echo "========================="
echo ""
echo "Create terraform/gcp/terraform.tfvars with:"
echo ""
cat <<EOF
project_id    = "$GCP_PROJECT_ID"
github_owner  = "$GITHUB_ORG"
github_repo   = "$GITHUB_REPO"
EOF

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Add the GitHub Actions secrets listed above"
echo "2. Create terraform/gcp/terraform.tfvars"
echo "3. Run: cd terraform/gcp && terraform init && terraform apply"
echo "4. Update your DNS to point to the load balancer IP"
echo "5. Push to main branch to trigger deployment"