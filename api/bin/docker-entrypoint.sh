#!/bin/bash

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# Create tmp/pids directory if it doesn't exist
mkdir -p /app/tmp/pids

# Run database migrations if needed
if [ "$RAILS_ENV" = "production" ] && [ -n "$DB_PASSWORD" ]; then
  echo "Running database migrations..."
  bundle exec rails db:migrate 2>/dev/null || echo "Skipping migrations (database not available)"
fi

echo "Starting Rails application on port ${PORT:-8080}..."

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"