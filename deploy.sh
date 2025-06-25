#!/bin/bash

# IndieOut Deployment Script
# Usage: ./deploy.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "=== IndieOut Deployment Script ==="
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"
echo ""

# Load environment-specific variables
if [ "$ENVIRONMENT" = "production" ]; then
    export $(grep -v '^#' .env.production | xargs)
elif [ "$ENVIRONMENT" = "staging" ]; then
    export $(grep -v '^#' .env.staging | xargs)
else
    echo "Invalid environment. Use 'production' or 'staging'"
    exit 1
fi

# Create backup
echo "Creating backup..."
pg_dump $DATABASE_URL > "backups/db_backup_${ENVIRONMENT}_${TIMESTAMP}.sql"
echo "Backup created: backups/db_backup_${ENVIRONMENT}_${TIMESTAMP}.sql"

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Install dependencies
echo "Installing dependencies..."
cd api
bundle install --deployment --without development test

cd ../client
npm ci --only=production

# Build frontend
echo "Building frontend..."
npm run build

# Run database migrations
echo "Running database migrations..."
cd ../api
RAILS_ENV=$ENVIRONMENT rails db:migrate

# Precompile assets
echo "Precompiling assets..."
RAILS_ENV=$ENVIRONMENT rails assets:precompile

# Clear cache
echo "Clearing cache..."
RAILS_ENV=$ENVIRONMENT rails tmp:clear
RAILS_ENV=$ENVIRONMENT rails cache:clear

# Restart services
echo "Restarting services..."
if command -v systemctl &> /dev/null; then
    sudo systemctl restart puma
    sudo systemctl restart nginx
    echo "Services restarted via systemctl"
elif command -v pm2 &> /dev/null; then
    pm2 restart indieout-api
    echo "API restarted via PM2"
else
    echo "Warning: No service manager found. Please restart manually."
fi

# Run health check
echo "Running health check..."
sleep 5
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "Health check passed!"
else
    echo "Health check failed! Please check the application."
    exit 1
fi

echo ""
echo "=== Deployment Complete ==="
echo "Environment: $ENVIRONMENT"
echo "Timestamp: $TIMESTAMP"
echo "Please verify the application is working correctly."