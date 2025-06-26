FROM ruby:2.3-slim

# Install dependencies
RUN apt-get update -qq && apt-get install -y build-essential libpq-dev nodejs git

WORKDIR /app

# Install bundler that works with Rails 3.2.6
RUN gem install bundler -v 1.17.3

# Copy Gemfile and install gems
COPY Gemfile Gemfile.lock ./
RUN bundle _1.17.3_ install --without development test

# Copy application code
COPY . .

# Setup Rails-specific settings for production
RUN cp config/database.yml.example config/database.yml || true
RUN bundle _1.17.3_ exec rake assets:precompile RAILS_ENV=production || true

# Set environment variables
ENV RAILS_ENV=production
ENV RACK_ENV=production

# Expose port
EXPOSE 8080

# Start the server
CMD ["bundle", "exec", "rails", "server", "-p", "8080", "-e", "production"]