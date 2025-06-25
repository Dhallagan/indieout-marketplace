#!/bin/bash
set -e

echo "Starting Rails API server..."
echo "PORT: ${PORT:-8080}"
echo "RAILS_ENV: ${RAILS_ENV}"

# Check if we can connect to the database
if [ -n "$DATABASE_URL" ]; then
  echo "DATABASE_URL is set, attempting database connection..."
  bundle exec rails db:version || echo "Warning: Could not connect to database"
else
  echo "Warning: DATABASE_URL not set"
fi

# Run Rails server
exec bundle exec puma -C config/puma.rb