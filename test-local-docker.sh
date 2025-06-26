#!/bin/bash

echo "Testing Docker build locally..."

# Create the same Dockerfile that GitHub Actions uses
cat > Dockerfile <<'EOF'
FROM ruby:3.3-slim

# OS deps
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev nodejs git \
    libyaml-dev libffi-dev && \
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

# Build the image
echo "Building Docker image..."
docker build -t indieout-test .

# Test if it starts
echo "Testing if container starts..."
docker run -d --name indieout-test-container -p 8080:8080 indieout-test

# Wait a bit for startup
echo "Waiting for container to start..."
sleep 10

# Check if it's running
echo "Checking container status..."
docker ps | grep indieout-test-container

# Check logs
echo "Container logs:"
docker logs indieout-test-container

# Cleanup
echo "Cleaning up..."
docker stop indieout-test-container || true
docker rm indieout-test-container || true
rm Dockerfile

echo "Test complete!"