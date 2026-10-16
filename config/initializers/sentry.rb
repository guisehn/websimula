if ENV['SENTRY_SERVER_URL'].present?
  Sentry.init do |config|
    config.dsn = ENV['SENTRY_SERVER_URL']
  end
end
