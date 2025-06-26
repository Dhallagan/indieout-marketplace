#!/bin/bash

# Script to set up Google Cloud Storage for the IndieOut marketplace

PROJECT_ID="indieout"
BUCKET_NAME="indieout-uploads"
SERVICE_ACCOUNT="github-actions-deployer@${PROJECT_ID}.iam.gserviceaccount.com"

echo "Setting up Google Cloud Storage for IndieOut..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed. Please install it first."
    exit 1
fi

# Set the project
echo "Setting project to ${PROJECT_ID}..."
gcloud config set project ${PROJECT_ID}

# Create the GCS bucket
echo "Creating GCS bucket ${BUCKET_NAME}..."
gsutil mb -p ${PROJECT_ID} -c standard -l us-central1 gs://${BUCKET_NAME}/ || echo "Bucket might already exist"

# Set bucket permissions for the service account
echo "Granting storage permissions to service account..."
gsutil iam ch serviceAccount:${SERVICE_ACCOUNT}:objectAdmin gs://${BUCKET_NAME}

# Enable versioning on the bucket (optional but recommended)
echo "Enabling versioning on bucket..."
gsutil versioning set on gs://${BUCKET_NAME}

# Set up CORS for the bucket (needed for direct uploads from browser)
echo "Setting up CORS..."
cat > cors.json <<EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "responseHeader": ["*"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set cors.json gs://${BUCKET_NAME}
rm cors.json

# Create lifecycle rules to clean up old cache files
echo "Setting up lifecycle rules..."
cat > lifecycle.json <<EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {
          "age": 7,
          "matchesPrefix": ["cache/"]
        }
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://${BUCKET_NAME}
rm lifecycle.json

echo ""
echo "✅ GCS setup complete!"
echo ""
echo "Next steps:"
echo "1. Add the following secrets to your GitHub repository:"
echo "   - GCS_BUCKET: ${BUCKET_NAME}"
echo "   - RAILS_MASTER_KEY: $(cat api/config/master.key 2>/dev/null || echo '[Copy from api/config/master.key]')"
echo "   - DB_PASSWORD: [Your database password]"
echo ""
echo "2. To add these secrets, go to:"
echo "   https://github.com/Dhallagan/indieout-marketplace/settings/secrets/actions"
echo ""
echo "3. The service account ${SERVICE_ACCOUNT} has been granted access to the bucket."
echo ""

# Optional: Set up GitHub secrets using gh CLI
if command -v gh &> /dev/null; then
    echo "GitHub CLI detected. Would you like to set up the secrets automatically? (y/n)"
    read -r response
    if [[ "$response" == "y" ]]; then
        echo "Setting GitHub secrets..."
        
        # Set GCS_BUCKET
        echo "${BUCKET_NAME}" | gh secret set GCS_BUCKET
        
        # Set RAILS_MASTER_KEY if the file exists
        if [ -f "api/config/master.key" ]; then
            gh secret set RAILS_MASTER_KEY < api/config/master.key
            echo "✅ RAILS_MASTER_KEY set from api/config/master.key"
        else
            echo "⚠️  api/config/master.key not found. Please set RAILS_MASTER_KEY manually."
        fi
        
        echo "✅ GitHub secrets configured!"
    fi
fi