#!/bin/bash

# Test locally without Docker
set -e

echo "🧪 Testing IndieOut locally (no Docker)..."

# Change to project root
cd "$(dirname "$0")/.."

# Check PostgreSQL
if ! pg_isready > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running. Please start it first."
    echo "   On macOS: brew services start postgresql"
    exit 1
fi

# Install dependencies
echo "Installing dependencies..."
npm run install:all

# Setup database
echo "Setting up database..."
cd api
bundle exec rails db:create db:migrate db:seed
cd ..

# Start both services
echo "Starting services..."
echo "Rails API will run on: http://localhost:5000"
echo "React app will run on: http://localhost:3000"
echo ""

# Use trap to handle cleanup
trap 'kill 0' EXIT

# Start Rails API in background
(cd api && rails server -p 5000) &

# Wait for Rails to start
sleep 5

# Start React frontend
cd client && npm run dev