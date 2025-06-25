# Deployment Guide

This guide covers multiple deployment options for the IndieOut marketplace application.

## Prerequisites

- Node.js 18+ and npm/yarn
- Ruby 3.2+ and bundler
- PostgreSQL 14+
- Git
- Domain name (for production)
- SSL certificate (for production)

## Deployment Options

### Option 1: VPS Deployment (DigitalOcean, Linode, AWS EC2)

#### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y curl git build-essential libssl-dev libreadline-dev zlib1g-dev \
  libpq-dev postgresql postgresql-contrib nginx nodejs npm redis-server

# Install Ruby via rbenv
git clone https://github.com/rbenv/rbenv.git ~/.rbenv
echo 'export PATH="$HOME/.rbenv/bin:$PATH"' >> ~/.bashrc
echo 'eval "$(rbenv init -)"' >> ~/.bashrc
source ~/.bashrc

git clone https://github.com/rbenv/ruby-build.git ~/.rbenv/plugins/ruby-build
rbenv install 3.2.2
rbenv global 3.2.2
```

#### 2. PostgreSQL Setup

```bash
sudo -u postgres createuser -s deploy
sudo -u postgres createdb indieout_production
```

#### 3. Application Deployment

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/indieout.git
sudo chown -R deploy:deploy indieout
cd indieout

# Install dependencies
bundle install --deployment --without development test
cd client && npm install && npm run build && cd ..

# Setup environment variables
cp .env.example .env.production
# Edit .env.production with your values

# Setup database
RAILS_ENV=production rails db:create db:migrate db:seed

# Precompile assets
RAILS_ENV=production rails assets:precompile

# Setup systemd services (see below)
```

#### 4. Nginx Configuration

Create `/etc/nginx/sites-available/indieout`:

```nginx
upstream app {
  server unix:///var/www/indieout/tmp/sockets/puma.sock;
}

server {
  listen 80;
  server_name yourdomain.com;
  return 301 https://$server_name$request_uri;
}

server {
  listen 443 ssl http2;
  server_name yourdomain.com;

  ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

  root /var/www/indieout/client/dist;
  
  # Serve static files
  location / {
    try_files $uri /index.html;
  }
  
  # API proxy
  location /api {
    proxy_pass http://app;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  
  # Rails uploads
  location /uploads {
    alias /var/www/indieout/api/public/uploads;
  }
}
```

### Option 2: Docker Deployment

#### Docker Compose Configuration

See `docker-compose.yml` in the root directory.

#### Deployment Steps

```bash
# Build and start containers
docker-compose up -d

# Run migrations
docker-compose exec api rails db:migrate

# Seed database (optional)
docker-compose exec api rails db:seed
```

### Option 3: Platform-as-a-Service (Heroku, Railway, Render)

#### Heroku Deployment

```bash
# Install Heroku CLI
# Create Heroku app
heroku create indieout-marketplace

# Add PostgreSQL
heroku addons:create heroku-postgresql:standard-0

# Add Redis
heroku addons:create heroku-redis:hobby-dev

# Set environment variables
heroku config:set RAILS_MASTER_KEY=$(cat api/config/master.key)
heroku config:set JWT_SECRET_KEY=your-secret-key
heroku config:set FRONTEND_URL=https://your-frontend-domain.com

# Deploy
git push heroku main

# Run migrations
heroku run rails db:migrate
```

#### Render Deployment

1. Create a new Web Service for the Rails API
2. Create a new Static Site for the React frontend
3. Create a PostgreSQL database
4. Configure environment variables
5. Deploy via Git

### Option 4: Kubernetes Deployment

See `k8s/` directory for Kubernetes manifests.

## Environment Variables

### Rails API (.env.production)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost/indieout_production

# Rails
RAILS_ENV=production
RAILS_MASTER_KEY=your-master-key
RAILS_LOG_TO_STDOUT=true
RAILS_SERVE_STATIC_FILES=true

# JWT
JWT_SECRET_KEY=your-jwt-secret

# CORS
FRONTEND_URL=https://yourdomain.com

# File uploads
SHRINE_STORAGE=s3  # or 'file' for local storage
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_BUCKET=indieout-uploads

# Email
SMTP_ADDRESS=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER_NAME=apikey
SMTP_PASSWORD=your-sendgrid-api-key
SMTP_DOMAIN=yourdomain.com
DEFAULT_FROM_EMAIL=noreply@yourdomain.com

# Stripe (when implemented)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
```

### React Frontend (.env.production)

```bash
VITE_API_URL=https://api.yourdomain.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

## SSL Certificates

### Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## Monitoring and Logging

### Application Monitoring

- **Sentry**: Error tracking
- **New Relic**: Performance monitoring
- **Datadog**: Infrastructure monitoring

### Log Management

- **Papertrail**: Centralized logging
- **ELK Stack**: Self-hosted logging

## Backup Strategy

### Database Backups

```bash
# Create backup script
cat > /home/deploy/backup_db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/deploy/backups"
DB_NAME="indieout_production"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
EOF

chmod +x /home/deploy/backup_db.sh

# Add to crontab
echo "0 2 * * * /home/deploy/backup_db.sh" | crontab -
```

### File Uploads Backup

If using local storage, sync uploads to S3:

```bash
aws s3 sync /var/www/indieout/api/public/uploads s3://indieout-backups/uploads --delete
```

## Performance Optimization

### CDN Setup

1. **Cloudflare**: Free tier available
2. **AWS CloudFront**: For S3-hosted assets
3. **Fastly**: Advanced caching options

### Caching

- Enable Rails caching in production
- Use Redis for cache store
- Configure HTTP caching headers

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_status ON products(status);
```

## Security Checklist

- [ ] SSL certificates installed
- [ ] Environment variables secured
- [ ] Database access restricted
- [ ] File upload size limits configured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers added
- [ ] Regular security updates scheduled
- [ ] Backup encryption enabled
- [ ] Monitoring alerts configured

## Deployment Commands

### Quick Deploy Script

```bash
#!/bin/bash
# deploy.sh

# Pull latest code
git pull origin main

# Install dependencies
cd api && bundle install
cd ../client && npm install

# Build frontend
npm run build

# Migrate database
cd ../api && RAILS_ENV=production rails db:migrate

# Restart services
sudo systemctl restart puma
sudo systemctl restart nginx
```

## Troubleshooting

### Common Issues

1. **Assets not loading**: Check Nginx configuration and asset precompilation
2. **CORS errors**: Verify FRONTEND_URL environment variable
3. **Database connection**: Check DATABASE_URL and PostgreSQL service
4. **File uploads failing**: Verify directory permissions and Shrine configuration

### Health Checks

Create health check endpoint in Rails:

```ruby
# config/routes.rb
get '/health', to: proc { [200, {}, ['OK']] }
```

Monitor with:
```bash
curl https://api.yourdomain.com/health
```