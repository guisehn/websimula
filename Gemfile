source 'https://rubygems.org'
ruby '3.4.11'

# Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'rails', '~> 8.0.0'
gem 'logger'
# Use Postgres as the database for Active Record
# Rails 7.1 uses keyword arguments for PG coders. Stay on 1.5 until that is
# exercised against pg 1.6.
gem 'pg', '~> 1.5.9'
# Use Puma as the app server
gem 'puma', '~> 6.4'
# Use SCSS for stylesheets
gem 'sass-rails', '~> 5.0'
# Rails 7 no longer depends on Sprockets. sass-rails 5 needs Sprockets 3.
gem 'sprockets-rails', '~> 3.4'
# Use Uglifier as compressor for JavaScript assets
gem 'uglifier', '>= 1.3.0'
# See https://github.com/rails/execjs#readme for more supported runtimes
# gem 'therubyracer', platforms: :ruby

# Use jquery as the JavaScript library
gem 'jquery-rails', '~> 4.3.5'
# Turbolinks makes navigating your web application faster. Read more: https://github.com/turbolinks/turbolinks
gem 'turbolinks', '~> 5'
# Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'jbuilder', '~> 2.7'
# Use Redis adapter to run Action Cable in production
gem 'redis', '~> 4.8'
# Use ActiveModel has_secure_password
# gem 'bcrypt', '~> 3.1.7'

# Use Capistrano for deployment
# gem 'capistrano-rails', group: :development

gem 'bootstrap-sass', '~> 3.4.1'
gem 'devise', '~> 4.9'
gem 'figaro'
gem 'simple_form', '~> 5.3'
gem 'shakapacker', '10.3.2'
gem 'resend'
gem 'paranoia', '~> 3.0'
gem 'will_paginate', '~> 3.3'
gem 'will_paginate-bootstrap'
gem 'sentry-ruby'
gem 'sentry-rails'
gem 'audited', '~> 5.4'
gem 'rack-canonical-host'

group :development, :test do
  # Call 'byebug' anywhere in the code to stop execution and get a debugger console
  gem 'byebug', platform: :mri
end

group :development do
  # Access an IRB console on exception pages or by using <%= console %> anywhere in the code.
  gem 'web-console'
  # Open sent mail in the browser instead of delivering it.
  gem 'letter_opener'
  gem 'listen', '~> 3.8'
  # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
  gem 'spring'
  gem 'spring-watcher-listen', '~> 2.1'
end

# Windows does not include zoneinfo files, so bundle the tzinfo-data gem
gem 'tzinfo-data', platforms: [:mingw, :mswin, :x64_mingw, :jruby]