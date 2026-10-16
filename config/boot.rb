ENV['BUNDLE_GEMFILE'] ||= File.expand_path('../Gemfile', __dir__)

require 'bundler/setup' # Set up gems listed in the Gemfile.
require 'logger' # concurrent-ruby 1.3.5+ no longer loads Logger, which Rails 6.1 expects.
