# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for production, not development. Use with Kamal or build'n'run by hand:
# docker build -t simula .
# docker run -d -p 3000:3000 -e RAILS_MASTER_KEY=<value from config/master.key> --name simula simula

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Make sure RUBY_VERSION matches the Ruby version in .tool-versions
ARG RUBY_VERSION=3.4.11
FROM docker.io/library/ruby:$RUBY_VERSION-slim AS base

# Rails app lives here
WORKDIR /rails

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y curl libjemalloc2 libvips postgresql-client && \
    ln -s /usr/lib/$(uname -m)-linux-gnu/libjemalloc.so.2 /usr/local/lib/libjemalloc.so && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Set production environment variables and enable jemalloc for reduced memory usage and latency.
ENV RAILS_ENV="production" \
    BUNDLE_DEPLOYMENT="1" \
    BUNDLE_PATH="/usr/local/bundle" \
    BUNDLE_WITHOUT="development" \
    RAILS_LOG_TO_STDOUT="1" \
    RAILS_SERVE_STATIC_FILES="1" \
    LD_PRELOAD="/usr/local/lib/libjemalloc.so"

# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build gems and node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev libyaml-dev node-gyp pkg-config python-is-python3 && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Install JavaScript dependencies.
# Node 22 and Yarn 1 match package.json. assets:precompile runs Shakapacker,
# and Yarn 1 checks the lockfile with --frozen-lockfile.
ARG NODE_VERSION=22.23.3
ARG YARN_VERSION=1.22.22
ENV PATH="/usr/local/node/bin:$PATH"
RUN curl -sL https://github.com/nodenv/node-build/archive/master.tar.gz | tar xz -C /tmp/ && \
    /tmp/node-build-master/bin/node-build "${NODE_VERSION}" /usr/local/node && \
    corepack enable && \
    corepack prepare "yarn@${YARN_VERSION}" --activate && \
    rm -rf /tmp/node-build-master

# Install application gems.
# Gemfile.lock is bundled with 2.4.7. The Ruby image's Bundler is newer.
COPY Gemfile Gemfile.lock ./
RUN gem install bundler -v 2.4.7 && \
    bundle install && \
    rm -rf ~/.bundle/ "${BUNDLE_PATH}"/ruby/*/cache "${BUNDLE_PATH}"/ruby/*/bundler/gems/*/.git

# Install node modules
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Precompiling assets for production without requiring secret RAILS_MASTER_KEY.
# This also compiles the Shakapacker pack.
RUN SECRET_KEY_BASE_DUMMY=1 ./bin/rails assets:precompile

RUN rm -rf node_modules

# Final stage for app image
FROM base

# Run and own only the runtime files as a non-root user for security
RUN groupadd --system --gid 1000 rails && \
    useradd rails --uid 1000 --gid 1000 --create-home --shell /bin/bash
USER 1000:1000

# Copy built artifacts: gems, application
COPY --chown=rails:rails --from=build "${BUNDLE_PATH}" "${BUNDLE_PATH}"
COPY --chown=rails:rails --from=build /rails /rails

# Start the server by default, this can be overwritten at runtime.
# Thruster is omitted. Puma listens on ENV["PORT"] from config/puma.rb.
EXPOSE 3000
CMD ["./bin/rails", "server"]
