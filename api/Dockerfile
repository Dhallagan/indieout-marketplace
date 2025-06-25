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
    curl

# Set working directory
WORKDIR /app

# Copy Gemfiles
COPY Gemfile Gemfile.lock ./

# Install gems
RUN bundle install --jobs 4 --retry 3

# Copy application code
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p tmp/pids tmp/sockets log storage public/uploads && \
    chmod -R 755 public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start Rails server
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]