#!/bin/bash

echo "Creating Dockerfile with libvips..."
cat > Dockerfile <<'EOF'
FROM ruby:3.2-slim

# OS deps
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev nodejs git \
    libyaml-dev libffi-dev libvips && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# App code
COPY api/ /app/

# Bundler config & install
RUN bundle config set --local path 'vendor/bundle' && \
    bundle config set --local without 'development test' && \
    bundle install

# Make entrypoint executable
RUN chmod +x /app/bin/docker-entrypoint.sh

# Precompile assets
RUN bundle exec rake assets:precompile RAILS_ENV=production || true

ENV RAILS_ENV=production RACK_ENV=production PORT=8080
EXPOSE 8080

ENTRYPOINT ["/app/bin/docker-entrypoint.sh"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
EOF

echo "Building Docker image..."
docker build -t indieout-api-test .

echo "Starting container..."
# Run with dummy database credentials since we're just testing startup
docker run -d --name indieout-api-test \
  -p 8080:8080 \
  -e RAILS_ENV=production \
  -e RACK_ENV=production \
  -e PORT=8080 \
  -e RAILS_MASTER_KEY=$(cat api/config/master.key 2>/dev/null || echo "dummy_key") \
  -e DB_HOST=localhost \
  -e DB_NAME=test \
  -e DB_USERNAME=test \
  -e DB_PASSWORD=test \
  -e GCS_BUCKET=test-bucket \
  -e GCP_PROJECT_ID=indieout \
  indieout-api-test

echo "Waiting for API to start (15 seconds)..."
sleep 15

echo "Checking if container is running..."
docker ps | grep indieout-api-test

echo "Container logs:"
docker logs indieout-api-test

echo "Testing API health endpoint..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/health || echo "API not responding"

echo "Testing Rails default page..."
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:8080/ || echo "API not responding"

echo "Cleanup..."
docker stop indieout-api-test
docker rm indieout-api-test
rm Dockerfile

echo "Test complete!"