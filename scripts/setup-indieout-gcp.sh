#!/bin/bash
# Script to set up GCP for Rails deployment to Cloud Run with PostgreSQL

# Exit on error
set -e

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration - MODIFY THESE VALUES
PROJECT_ID="indieout" # Your specific project ID
PROJECT_NAME="IndieOut"
REGION="us-central1"
SERVICE_NAME="indieout"
DB_INSTANCE_NAME="indieout-db"
DB_NAME="indieout_production"
DB_USER="indieout-app-user"
SA_NAME="github-actions-deployer"

# Reset flag - set to true to delete and recreate resources
RESET_ALL="true"  # Change to "false" if you don't want to reset everything
RAILS_MASTER_KEY=$(cat config/master.key 2>/dev/null || echo "")

# Check if RAILS_MASTER_KEY is provided or prompt for it
SECRET_TOKEN=$(grep -A 2 "config.secret_token" config/initializers/secret_token.rb 2>/dev/null | grep -o "'.*'" | tr -d "'" || echo "")

if [ -z "$SECRET_TOKEN" ]; then
  echo -e "${YELLOW}Rails secret token not found. Please enter it manually:${NC}"
  read -s SECRET_TOKEN
  
  if [ -z "$SECRET_TOKEN" ]; then
    echo -e "${YELLOW}No secret token provided. Generating a new one...${NC}"
    SECRET_TOKEN=$(openssl rand -hex 64)
  fi
fi

# Generate a secure password for the database
DB_PASSWORD=$(openssl rand -base64 16)

echo -e "${BOLD}=== Setting up GCP for Rails deployment ===${NC}"
echo "Project ID: $PROJECT_ID"
echo "Region: $REGION"
echo "Service Name: $SERVICE_NAME"
echo "Database Instance: $DB_INSTANCE_NAME"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}gcloud CLI is not installed. Please install it first.${NC}"
  echo "Visit: https://cloud.google.com/sdk/docs/install"
  exit 1
fi

# Check if logged in
ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -z "$ACCOUNT" ]; then
  echo -e "${YELLOW}You are not logged in to gcloud. Please login:${NC}"
  gcloud auth login
fi

echo -e "\n${BOLD}Creating new GCP project...${NC}"
# Check if project already exists
if gcloud projects describe $PROJECT_ID &>/dev/null; then
  echo -e "${YELLOW}Project $PROJECT_ID already exists. Using existing project.${NC}"
else
  gcloud projects create $PROJECT_ID --name="$PROJECT_NAME"
fi
gcloud config set project $PROJECT_ID

echo -e "\n${BOLD}Enabling billing...${NC}"
# Check if billing is already enabled
BILLING_INFO=$(gcloud billing projects describe $PROJECT_ID 2>/dev/null || echo "")
if [[ -n "$BILLING_INFO" ]]; then
  echo -e "${YELLOW}Billing is already enabled for project $PROJECT_ID.${NC}"
else
  echo -e "${YELLOW}Note: You need to link a billing account to continue.${NC}"
  echo "Available billing accounts:"
  gcloud billing accounts list

  echo "Enter the billing account ID to use:"
  read BILLING_ACCOUNT_ID

  if [ -z "$BILLING_ACCOUNT_ID" ]; then
    echo -e "${RED}No billing account provided. Exiting.${NC}"
    exit 1
  fi

  gcloud billing projects link $PROJECT_ID --billing-account=$BILLING_ACCOUNT_ID
fi

echo -e "\n${BOLD}Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com \
                       run.googleapis.com \
                       containerregistry.googleapis.com \
                       sqladmin.googleapis.com \
                       cloudresourcemanager.googleapis.com \
                       secretmanager.googleapis.com \
                       iam.googleapis.com

echo -e "\n${BOLD}Creating Cloud SQL PostgreSQL instance...${NC}"
echo -e "${YELLOW}This may take several minutes...${NC}"
# Check if the Cloud SQL instance already exists
if gcloud sql instances describe $DB_INSTANCE_NAME &>/dev/null; then
  if [[ "$RESET_ALL" == "true" ]]; then
    echo -e "${YELLOW}Deleting existing Cloud SQL instance $DB_INSTANCE_NAME...${NC}"
    gcloud sql instances delete $DB_INSTANCE_NAME --quiet
    
    echo -e "${GREEN}Creating new Cloud SQL instance $DB_INSTANCE_NAME...${NC}"
    gcloud sql instances create $DB_INSTANCE_NAME \
      --database-version=POSTGRES_15 \
      --tier=db-f1-micro \
      --region=$REGION \
      --root-password=$DB_PASSWORD \
      --storage-size=10GB \
      --storage-type=SSD \
      --availability-type=ZONAL
  else
    echo -e "${YELLOW}Cloud SQL instance $DB_INSTANCE_NAME already exists. Using existing instance.${NC}"
  fi
else
  gcloud sql instances create $DB_INSTANCE_NAME \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=$REGION \
    --root-password=$DB_PASSWORD \
    --storage-size=10GB \
    --storage-type=SSD \
    --availability-type=ZONAL
fi

echo -e "\n${BOLD}Creating database and user...${NC}"
# Check if the database already exists
if gcloud sql databases list --instance=$DB_INSTANCE_NAME 2>/dev/null | grep -q $DB_NAME; then
  if [[ "$RESET_ALL" == "true" ]]; then
    echo -e "${YELLOW}Dropping existing database $DB_NAME...${NC}"
    gcloud sql databases delete $DB_NAME --instance=$DB_INSTANCE_NAME --quiet
    
    echo -e "${GREEN}Creating new database $DB_NAME...${NC}"
    gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME
  else
    echo -e "${YELLOW}Database $DB_NAME already exists in instance $DB_INSTANCE_NAME.${NC}"
  fi
else
  gcloud sql databases create $DB_NAME --instance=$DB_INSTANCE_NAME
fi

# Check if the user already exists
if gcloud sql users list --instance=$DB_INSTANCE_NAME 2>/dev/null | grep -q $DB_USER; then
  if [[ "$RESET_ALL" == "true" ]]; then
    echo -e "${YELLOW}Dropping existing user $DB_USER...${NC}"
    gcloud sql users delete $DB_USER --instance=$DB_INSTANCE_NAME --quiet
    
    echo -e "${GREEN}Creating new user $DB_USER...${NC}"
    gcloud sql users create $DB_USER \
      --instance=$DB_INSTANCE_NAME \
      --password=$DB_PASSWORD
  else
    echo -e "${YELLOW}User $DB_USER already exists in instance $DB_INSTANCE_NAME.${NC}"
    echo -e "${YELLOW}Resetting password for $DB_USER...${NC}"
    gcloud sql users set-password $DB_USER \
      --instance=$DB_INSTANCE_NAME \
      --password=$DB_PASSWORD
  fi
else
  gcloud sql users create $DB_USER \
    --instance=$DB_INSTANCE_NAME \
    --password=$DB_PASSWORD
fi

echo -e "\n${BOLD}Creating service account for GitHub Actions...${NC}"
# Check if the service account already exists
if gcloud iam service-accounts describe $SA_NAME@$PROJECT_ID.iam.gserviceaccount.com &>/dev/null; then
  if [[ "$RESET_ALL" == "true" ]]; then
    echo -e "${YELLOW}Deleting existing service account $SA_NAME...${NC}"
    # First delete any existing keys
    KEYS=$(gcloud iam service-accounts keys list --iam-account=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com --format="value(name)")
    for KEY in $KEYS; do
      echo -e "${YELLOW}Deleting key $KEY...${NC}"
      gcloud iam service-accounts keys delete $KEY --iam-account=$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com --quiet
    done
    
    # Now delete the service account
    gcloud iam service-accounts delete $SA_NAME@$PROJECT_ID.iam.gserviceaccount.com --quiet
    
    echo -e "${GREEN}Creating new service account $SA_NAME...${NC}"
    gcloud iam service-accounts create $SA_NAME \
      --display-name="GitHub Actions Deployer"
  else
    echo -e "${YELLOW}Service account $SA_NAME already exists. Using existing service account.${NC}"
  fi
else
  gcloud iam service-accounts create $SA_NAME \
    --display-name="GitHub Actions Deployer"
fi

echo -e "\n${BOLD}Granting required permissions to the service account...${NC}"
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudsql.admin"

echo -e "\n${BOLD}Creating and downloading service account key...${NC}"
mkdir -p ./secrets

# Always create a new key when resetting everything
if [[ "$RESET_ALL" == "true" ]]; then
  if [ -f ./secrets/gcp-sa-key.json ]; then
    echo -e "${YELLOW}Removing existing service account key file...${NC}"
    rm ./secrets/gcp-sa-key.json
  fi
  echo -e "${GREEN}Creating new service account key...${NC}"
  gcloud iam service-accounts keys create ./secrets/gcp-sa-key.json \
    --iam-account="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
else
  echo -e "${YELLOW}Would you like to generate a new service account key? (y/n)${NC}"
  echo -e "${YELLOW}Note: If you already have a key and don't need a new one, select 'n'${NC}"
  read GENERATE_KEY

  if [[ $GENERATE_KEY == "y" || $GENERATE_KEY == "Y" || -z "$GENERATE_KEY" ]]; then
    gcloud iam service-accounts keys create ./secrets/gcp-sa-key.json \
      --iam-account="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
    echo -e "${GREEN}New service account key created at ./secrets/gcp-sa-key.json${NC}"
  else
    echo -e "${YELLOW}Skipping service account key generation.${NC}"
    if [ ! -f ./secrets/gcp-sa-key.json ]; then
      echo -e "${YELLOW}Warning: No service account key found at ./secrets/gcp-sa-key.json${NC}"
      echo -e "${YELLOW}You'll need to provide this key manually for GitHub Actions.${NC}"
      echo -e "${YELLOW}Would you like to create one now? (y/n)${NC}"
      read CREATE_KEY_NOW
      if [[ $CREATE_KEY_NOW == "y" || $CREATE_KEY_NOW == "Y" ]]; then
        gcloud iam service-accounts keys create ./secrets/gcp-sa-key.json \
          --iam-account="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"
        echo -e "${GREEN}New service account key created at ./secrets/gcp-sa-key.json${NC}"
      fi
    fi
  fi
fi

echo -e "\n${BOLD}Generating the DATABASE_URL...${NC}"
DB_CONNECTION_NAME="$PROJECT_ID:$REGION:$DB_INSTANCE_NAME"
DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost/$DB_NAME?host=/cloudsql/$DB_CONNECTION_NAME"

# Save the secrets to a file
echo -e "\n${BOLD}Saving secrets to ./secrets/github-secrets.txt...${NC}"
cat > ./secrets/github-secrets.txt << EOL
# GitHub Secrets for Rails deployment to GCP Cloud Run
# Add these secrets to your GitHub repository at:
# Settings > Secrets and variables > Actions

GCP_PROJECT_ID: $PROJECT_ID
GCP_REGION: $REGION
GCP_SERVICE_NAME: $SERVICE_NAME
GCP_SA_KEY: $(cat ./secrets/gcp-sa-key.json | jq -c)
DATABASE_URL: $DATABASE_URL
RAILS_MASTER_KEY: $RAILS_MASTER_KEY
DB_CONNECTION_NAME: $DB_CONNECTION_NAME

# For reference:
DB_INSTANCE_NAME: $DB_INSTANCE_NAME
DB_NAME: $DB_NAME
DB_USER: $DB_USER
DB_PASSWORD: $DB_PASSWORD
EOL

chmod 600 ./secrets/github-secrets.txt
chmod 600 ./secrets/gcp-sa-key.json

echo -e "\n${GREEN}${BOLD}Setup complete!${NC}"
echo -e "${BOLD}Your GCP project and Cloud SQL database are ready.${NC}"
echo -e "All secrets needed for GitHub Actions are saved in: ${BOLD}./secrets/github-secrets.txt${NC}"
echo -e "Service account key is saved in: ${BOLD}./secrets/gcp-sa-key.json${NC}"
echo -e "\n${YELLOW}IMPORTANT: Keep these files secure and never commit them to your repository!${NC}"
echo -e "Add these secrets to your GitHub repository's secrets."
echo -e "\n${BOLD}Next steps:${NC}"
echo "1. Update your GitHub Actions workflow file with the correct project ID, region, and service name"
echo "2. Add the secrets to your GitHub repository"
echo "3. Push your code to GitHub to trigger the deployment"