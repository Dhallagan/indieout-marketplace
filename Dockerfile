FROM ruby:2.5-slim           # 2.3 is EOL; 2.5 is still old but safer

# OS packages
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev nodejs git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ---- Bundler ----
RUN gem install bundler -v 2.5.6

# Copy app code
COPY api/ /app/

# (optional) patch Gemfile platform list if you haven't fixed it in the repo
# RUN sed -i 's/%i\[ windows jruby \]/[:mingw, :mswin, :x64_mingw, :jruby]/' Gemfile

# Install gems
RUN bundle config set --local path 'vendor/bundle' && \
    bundle install --without development test

# Precompile assets etc.
RUN cp config/database.yml.example config/database.yml || true && \
    bundle exec rake assets:precompile RAILS_ENV=production || true

ENV RAILS_ENV=production RACK_ENV=production
EXPOSE 8080
CMD ["bundle", "exec", "rails", "server", "-p", "8080", "-e", "production"]
