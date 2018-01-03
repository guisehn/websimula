# This file is used by Rack-based servers to start the application.

require_relative 'config/environment'

# example of usage:
# dokku config:set websimula CANONICAL_HOST=www.websimula.com
# dokku config:set websimula CANONICAL_HOST_IF=websimula\\.com
if ENV['CANONICAL_HOST']
  options = { cache_control: 'no-cache' }
  options[:ignore] = Regexp.new(ENV['CANONICAL_HOST_IGNORE']) if ENV['CANONICAL_HOST_IGNORE']
  options[:if] = Regexp.new(ENV['CANONICAL_HOST_IF']) if ENV['CANONICAL_HOST_IF']

  use Rack::CanonicalHost, ENV['CANONICAL_HOST'], options
end

run Rails.application
