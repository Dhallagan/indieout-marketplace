#!/bin/bash
set -e

echo "Running database migrations on Fly.io..."
fly ssh console --app indieout <<'EOF'
cd /app/api
bundle exec rails db:migrate
echo "Migrations completed!"
exit
EOF

echo "Migration script completed"