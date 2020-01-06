require_relative 'boot'

require 'rails/all'

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module Simula
  class Application < Rails::Application
    # Settings in config/environments/* take precedence over those specified here.
    # Application configuration should go into files in config/initializers
    # -- all .rb files in that directory are automatically loaded.
    config.load_defaults '6.0'

    config.i18n.default_locale = :'pt-BR'

    config.time_zone = 'Brasilia'
    config.active_record.default_timezone = :local

    config.action_mailer.delivery_method = :postmark
    config.action_mailer.postmark_settings = { api_token: ENV['POSTMARK_KEY'] }
    config.action_mailer.default_url_options = { host: ENV['APP_HOST_URL'] }

    config.filter_parameters << :password

    if ENV['SENTRY_SERVER_URL'].present?
      Raven.configure do |config|
        config.dsn = ENV['SENTRY_SERVER_URL']
        config.sanitize_fields = Rails.application.config.filter_parameters.map(&:to_s)
      end
    end
  end
end
