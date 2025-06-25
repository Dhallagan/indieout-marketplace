# Rails API Dockerfile
FROM ruby:3.2.6-alpine AS base

# Install runtime dependencies
RUN apk add --no-cache \
    postgresql-client \
    tzdata \
    gcompat \
    libpq \
    vips \
    vips-dev \
    curl

# Set working directory
WORKDIR /app

# Install build dependencies
FROM base AS builder

RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    git \
    vips-dev

# Copy Gemfiles
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3 && \
    rm -rf /usr/local/bundle/cache/*.gem && \
    find /usr/local/bundle/gems/ -name "*.c" -delete && \
    find /usr/local/bundle/gems/ -name "*.o" -delete

# Final stage
FROM base

# Copy installed gems from builder
COPY --from=builder /usr/local/bundle /usr/local/bundle

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p tmp/pids tmp/sockets log storage public/uploads && \
    chmod -R 755 public

# Add non-root user
RUN addgroup -g 1000 -S rails && \
    adduser -u 1000 -S rails -G rails && \
    chown -R rails:rails /app

# Switch to non-root user
USER rails

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start Rails server
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]