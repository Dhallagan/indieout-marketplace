#!/bin/bash
set -e

# Remove a potentially pre-existing server.pid for Rails.
rm -f /app/tmp/pids/server.pid

# Run database migrations if needed
if [ "$RAILS_ENV" = "production" ] && [ -n "$DB_PASSWORD" ]; then
  echo "Running database migrations..."
  bundle exec rails db:migrate || echo "Skipping migrations (database not available)"
fi

# Then exec the container's main process (what's set as CMD in the Dockerfile).
exec "$@"