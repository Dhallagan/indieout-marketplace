FROM ruby:3.2-slim

# OS dependencies
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev nodejs git \
    libyaml-dev libffi-dev libvips && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy application code
COPY api/ /app/

# Install gems
RUN bundle config set --local path 'vendor/bundle' && \
    bundle config set --local without 'development test' && \
    bundle install

# Make entrypoint executable
RUN chmod +x /app/bin/docker-entrypoint.sh

# Precompile assets
RUN bundle exec rake assets:precompile RAILS_ENV=production || true

# Set environment
ENV RAILS_ENV=production RACK_ENV=production PORT=8080
EXPOSE 8080

# Use entrypoint script
ENTRYPOINT ["/app/bin/docker-entrypoint.sh"]
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]