#!/bin/bash

# Deploy monorepo to Fly.io
set -e

echo "🚀 Deploying IndieOut monorepo to Fly.io..."

# Change to project root
cd "$(dirname "$0")/.."

# Check if app exists
if ! fly status --app indieout-monorepo 2>/dev/null; then
    echo "Creating Fly.io app..."
    fly launch --no-deploy --name indieout-monorepo --region den
    
    # Create Postgres database
    echo "Creating Postgres database..."
    fly postgres create --name indieout-monorepo-db --region den
    fly postgres attach --app indieout-monorepo indieout-monorepo-db
    
    echo ""
    echo "⚠️  IMPORTANT: Set your secrets before continuing!"
    echo ""
    echo "Run the following command with your values:"
    echo ""
    echo "fly secrets set \\"
    echo "  RAILS_MASTER_KEY=<your-master-key> \\"
    echo "  AWS_ACCESS_KEY_ID=<tigris-access-key> \\"
    echo "  AWS_SECRET_ACCESS_KEY=<tigris-secret-key> \\"
    echo "  BUCKET_NAME=indieout-storage \\"
    echo "  AWS_ENDPOINT_URL_S3=https://fly.storage.tigris.dev \\"
    echo "  AWS_REGION=auto \\"
    echo "  JWT_SECRET=<your-jwt-secret> \\"
    echo "  --app indieout-monorepo"
    echo ""
    read -p "Have you set all required secrets? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please set secrets first, then run this script again."
        exit 1
    fi
fi

# Update dependencies
echo "Installing dependencies..."
npm run install:all

# Deploy
echo "Deploying to Fly.io..."
fly deploy --build-arg VITE_API_URL=https://indieout-monorepo.fly.dev

echo "✅ Monorepo deployment complete!"
echo "🔗 App URL: https://indieout-monorepo.fly.dev"
echo ""
echo "The app serves:"
echo "  - Frontend at: https://indieout-monorepo.fly.dev"
echo "  - API at: https://indieout-monorepo.fly.dev/api"