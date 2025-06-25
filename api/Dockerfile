# Rails API Dockerfile
FROM ruby:3.2.6-alpine

# Install dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-client \
    postgresql-dev \
    tzdata \
    git \
    vips \
    vips-dev \
    curl \
    bash

# Set working directory
WORKDIR /app

# Copy Gemfiles
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p tmp/pids tmp/sockets log storage public/uploads && \
    chmod -R 755 .

# Copy entrypoint script
COPY docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Expose port
EXPOSE 8080

# Start Rails server
ENTRYPOINT ["/app/docker-entrypoint.sh"]