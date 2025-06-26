FROM ruby:2.5-slim        # 2.3 is EOL; Rails 3.2 runs fine on 2.5

# OS packages – add yarn if you precompile JS/CSS
RUN apt-get update -qq && \
    apt-get install -y build-essential libpq-dev nodejs git && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Bundler that matches Rails 3.x
RUN gem install bundler -v 1.17.3

# Copy app
COPY api/ /app/

# Patch Gemfile (remove after you fix it in the repo)
RUN sed -i 's/%i\[ windows jruby \]/[:mingw, :mswin, :x64_mingw, :jruby]/' Gemfile

# Install gems
RUN bundle _1.17.3_ config set --local path 'vendor/bundle' && \
    bundle _1.17.3_ install --without development test

# Pre-compile assets (ignore if the app has none)
RUN cp config/database.yml.example config/database.yml || true && \
    bundle _1.17.3_ exec rake assets:precompile RAILS_ENV=production || true

ENV RAILS_ENV=production \
    RACK_ENV=production \
    BUNDLE_DEPLOYMENT=1

EXPOSE 8080
CMD ["bundle", "exec", "rails", "server", "-p", "8080", "-e", "production"]
