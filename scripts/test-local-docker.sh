#!/bin/bash

# Test the monorepo locally with Docker
set -e

echo "🧪 Testing IndieOut locally with Docker..."

# Change to project root
cd "$(dirname "$0")/.."

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cat > .env << EOF
RAILS_MASTER_KEY=test_master_key_123456789
JWT_SECRET=test_jwt_secret_123
AWS_ACCESS_KEY_ID=test_key
AWS_SECRET_ACCESS_KEY=test_secret
BUCKET_NAME=test-bucket
AWS_ENDPOINT_URL_S3=https://test.endpoint
AWS_REGION=us-east-1
EOF
fi

echo ""
echo "Choose test mode:"
echo "1) Development mode (Rails + React with hot reload)"
echo "2) Production mode (Full monorepo build)"
echo "3) Both"
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "Starting development environment..."
        docker-compose up postgres api client
        ;;
    2)
        echo "Building and starting production-like environment..."
        docker-compose --profile production up monorepo
        ;;
    3)
        echo "Starting all services..."
        docker-compose --profile production up
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac