# Multi-stage Dockerfile for monorepo deployment to Fly.io
# Builds both Rails API and React frontend

# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files from monorepo
COPY client/package*.json ./client/

# Install frontend dependencies
WORKDIR /app/client
RUN npm ci

# Copy frontend source
COPY client/ /app/client/

# Build frontend with production API URL
ARG VITE_API_URL=https://indieout.fly.dev
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Stage 2: Build Rails API
FROM ruby:3.2.2-slim AS api-builder

# Install build dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    build-essential \
    git \
    libpq-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install bundler
RUN gem install bundler

# Copy Gemfiles from monorepo
COPY api/Gemfile api/Gemfile.lock ./api/

# Install gems
WORKDIR /app/api
RUN bundle config set --local deployment 'true' && \
    bundle config set --local without 'development test' && \
    bundle install --jobs 4 --retry 3

# Copy Rails app
COPY api/ /app/api/

# Precompile bootsnap
RUN bundle exec bootsnap precompile --gemfile app/ lib/

# Stage 3: Production Image
FROM ruby:3.2.2-slim

# Install runtime dependencies and nginx
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
    libpq-dev \
    libvips42 \
    nginx \
    curl \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy Rails app from builder
COPY --from=api-builder /app/api /app/api
COPY --from=api-builder /usr/local/bundle /usr/local/bundle

# Copy frontend build to nginx directory
COPY --from=frontend-builder /app/client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY <<EOF /etc/nginx/sites-available/default
server {
    listen 80;
    server_name _;

    # Serve frontend
    location / {
        root /usr/share/nginx/html;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Proxy API requests to Rails
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }

    # Rails health check
    location /up {
        proxy_pass http://localhost:3000/up;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }
}
EOF

# Copy supervisor configuration
COPY <<EOF /etc/supervisor/conf.d/supervisord.conf
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0
loglevel=info

[program:nginx]
command=nginx -g 'daemon off;'
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:rails]
command=/app/api/docker-entrypoint.sh
directory=/app/api
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
environment=RAILS_ENV="production",RAILS_LOG_TO_STDOUT="true",PORT="3000"
EOF

# Create Rails entrypoint script
COPY <<EOF /app/api/docker-entrypoint.sh
#!/bin/bash
set -e

cd /app/api

# Skip database check if DATABASE_URL is set (Fly.io handles this)
if [ -z "\$DATABASE_URL" ]; then
  echo "Waiting for database..."
  until PGPASSWORD=\$POSTGRES_PASSWORD pg_isready -h \$DB_HOST -U \$DB_USER; do
    echo "Database is unavailable - sleeping"
    sleep 2
  done
fi

# Run migrations if needed
if [ "\$RUN_MIGRATIONS" = "true" ]; then
  echo "Running database migrations..."
  bundle exec rails db:migrate
fi

# Start Rails server
echo "Starting Rails server..."
exec bundle exec rails server -b 0.0.0.0 -p 3000
EOF

# Make entrypoint executable
RUN chmod +x /app/api/docker-entrypoint.sh

# Create directories and set permissions
RUN mkdir -p /app/api/tmp/pids /app/api/tmp/cache /app/api/tmp/sockets /app/api/log /app/api/storage && \
    chmod -R 755 /app/api/tmp /app/api/log /app/api/storage

# Environment variables
ENV RAILS_ENV=production \
    RAILS_LOG_TO_STDOUT=true \
    RAILS_SERVE_STATIC_FILES=true \
    PORT=80

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost/health || exit 1

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]