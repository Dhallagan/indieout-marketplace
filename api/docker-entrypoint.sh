#!/bin/bash
set -e

echo "Starting Rails API server..."
echo "PORT: ${PORT:-8080}"
echo "RAILS_ENV: ${RAILS_ENV}"

# Run Rails server
exec bundle exec puma -C config/puma.rb