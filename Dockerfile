FROM ruby:3.2-slim

# OS packages -----------------------------------------------------------
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
        build-essential libpq-dev nodejs git \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Bundler that matches Ruby 3.2  ---------------------------------------
# (Bundler 2.5.x ships with ruby:3.2 images—no explicit install needed)
WORKDIR /app

# Copy the app ----------------------------------------------------------
COPY api/ /app/

# Install gems ----------------------------------------------------------
RUN bundle config set --local path 'vendor/bundle' && \
    bundle config set --local without 'development test' && \
    bundle install -j$(nproc)

# Pre-compile assets (if you have any) ----------------------------------
RUN cp config/database.yml.example config/database.yml || true && \
    bundle exec rake assets:precompile RAILS_ENV=production || true

ENV RAILS_ENV=production RACK_ENV=production
EXPOSE 8080
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
