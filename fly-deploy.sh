#!/bin/bash

# Fly.io Deployment Script for IndieOut
# Usage: ./fly-deploy.sh [api|frontend|both]

set -e

TARGET=${1:-both}

echo "=== IndieOut Fly.io Deployment ==="
echo "Target: $TARGET"
echo ""

# Function to deploy API
deploy_api() {
    echo "Deploying Rails API..."
    cd api
    
    # Check if app exists
    if ! fly status &>/dev/null; then
        echo "First time deployment detected. Running 'fly launch'..."
        fly launch --no-deploy
        
        echo "Setting secrets..."
        fly secrets set \
            RAILS_MASTER_KEY="$(cat config/master.key)" \
            JWT_SECRET_KEY="$(openssl rand -base64 32)" \
            SECRET_KEY_BASE="$(openssl rand -base64 32)" \
            FRONTEND_URL="https://indieout-frontend.fly.dev"
    fi
    
    # Deploy
    fly deploy
    
    # Show status
    fly status
    
    cd ..
}

# Function to deploy frontend
deploy_frontend() {
    echo "Deploying React Frontend..."
    cd client
    
    # Check if app exists
    if ! fly status &>/dev/null; then
        echo "First time deployment detected. Running 'fly launch'..."
        fly launch --no-deploy
    fi
    
    # Deploy
    fly deploy
    
    # Show status
    fly status
    
    cd ..
}

# Main deployment logic
case $TARGET in
    api)
        deploy_api
        ;;
    frontend)
        deploy_frontend
        ;;
    both)
        deploy_api
        echo ""
        deploy_frontend
        ;;
    *)
        echo "Invalid target. Use: api, frontend, or both"
        exit 1
        ;;
esac

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "API URL: https://indieout-api.fly.dev"
echo "Frontend URL: https://indieout-frontend.fly.dev"
echo ""
echo "Next steps:"
echo "1. Verify health endpoints:"
echo "   curl https://indieout-api.fly.dev/health"
echo "2. Check logs:"
echo "   cd api && fly logs"
echo "   cd client && fly logs"