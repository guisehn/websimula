# Upgrade to Rails 8.1 and Railway

Target **Ruby 3.4** and **Rails 8.1**. Rails 8.1 is tested against Ruby 3.4. Leave Ruby 4 until the app is already green on 8.1: it drops the `cgi` standard library and still trips older gems.

The app is Rails 8.1.4 on Ruby 3.4.11, with Sprockets (Bootstrap 3, Sass, jQuery) and Shakapacker 10.3.2 (Webpack 5, Vue 2, Node 22.23.3) side by side. Do the upgrade in small steps. A single jump to 8.1 will fail on gem constraints before a Dockerfile will build.

`rails test` is the checkpoint after each step. The request tests cover sign-in, projects, agents, variables, rules, membership, and the simulation page.

## 1. Known-good baseline

Boot the app and run `rails test` on the current stack, and keep that commit as the rollback point. The production database is the source of truth. Do not rewrite old migrations. `db/schema.rb` uses `serial` primary keys from 2017, and those should stay as they are when the schema is loaded on a newer Postgres.

## 2. Move Ruby before Rails

Rails 6.1.7.10 is the last 6.1 release. Its suite passes on Ruby 3.1 through 3.4. On 3.4, `require "logger"` before Rails boots, because Logger is no longer loaded by default. That require is already in `config/boot.rb`, because current `concurrent-ruby` no longer loads Logger for Rails 6.1.

Ruby 3.4.11 is in place. The gem bumps below are done. `paranoia` is 3.1 as of the Rails 7.0 step. `redis` stays on 4.8 until Action Cable requires 5.

While still on 6.1, loosen or replace the gems that cannot survive the next Rails bump:

| Gem now                                                      | What to do                                                                                                                                                                       |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audited` 4.10                                               | Hard-locked to Active Record `< 6.2`. Move to audited 5.x before leaving 6.1.                                                                                                    |
| `paranoia` 2.6                                               | Done on Rails 7.0: now 3.1. `acts_as_paranoid` stays.                                                                                                                            |
| `puma` `~> 3.12.2`                                           | Move to 6.x. 3.12 is far behind current security releases.                                                                                                                       |
| `redis` `~> 3.0`                                             | Move to 4.x, then 5.x when Action Cable asks for it. `config/cable.yml` already reads `REDIS_URL`.                                                                               |
| `listen` `~> 3.0.5`                                          | Move to `~> 3.8` or the dev group will not boot.                                                                                                                                 |
| `devise` 4.7 / `simple_form` 5.0                             | Bump to current 4.9 and 5.3.                                                                                                                                                     |
| `sentry-raven`                                               | Replace with `sentry-ruby` and `sentry-rails`. `Raven.configure` in `config/application.rb` and `Raven.user_context` in the controller become `Sentry.init` / `Sentry.set_user`. |
| `rails_12factor`                                             | Delete it. It only existed to set `RAILS_SERVE_STATIC_FILES` and `RAILS_LOG_TO_STDOUT` on Heroku. Set those yourself.                                                            |
| `postmark-rails`, `will_paginate`, `will_paginate-bootstrap` | Bump and boot the app. The Bootstrap paginator is the one most likely to be abandoned.                                                                                           |

`figaro` can stay for local `config/application.yml`. Railway injects real env vars, so production does not need that file.

## 3. Climb Rails one minor version at a time

`config.load_defaults` is `8.1`. `config/secrets.yml` is gone: production reads `SECRET_KEY_BASE` from the environment, and development and test use the generated `tmp/local_secret.txt`. Rails 8.1 is the last framework stop. Each stop followed these steps:

1. Set the Gemfile to that version and `bundle update rails`.
2. Run `bin/rails app:update` and review the diffs. Keep the mailer, locale, and time zone settings.
3. Raise `config.load_defaults` only to the version just finished, after reading the new defaults.
4. Run `rails test` and click through login, a project, and the simulator.

Version gates:

- Rails 7.0 drops the classic autoloader. The app is already on Zeitwerk.
- Done: Rails 7.1 removed `config/secrets.yml`. Production reads `SECRET_KEY_BASE` from the environment. Development and test use `tmp/local_secret.txt`.
- Done: Rails 7.2. `load_defaults 7.2` turns on YJIT when the Ruby build has it, waits to enqueue jobs until the current transaction commits, decodes PostgreSQL `date` values as `Date`, and rejects migration timestamps more than a day in the future. Enums use positional arguments (`enum :visibility, [:secret, :open]`), which Rails 8.0 requires. The `json` Gemfile pin is gone because 7.2 no longer passes `quirks_mode`; the lockfile still resolved 2.6.3. `pg` stays on 1.5.
- Done: Ruby 3.4.11, still on Rails 7.2.4. The `sass` 3.7 gem warns that its string literals will be frozen in a later Ruby; the suite still passes.
- Done: Rails 8.0.5.1. `load_defaults 8.0` makes `to_time` keep the receiver's time zone, lets an `ETag` win over `Last-Modified`, and sets `Regexp.timeout` to 1 second. The global `enqueue_after_transaction_commit` setting from 7.2 is gone in 8.0; do not put it back. `app:update` wanted to overwrite `config/boot.rb`, the environment files, and `config/puma.rb`, and it copied Active Storage migrations. Those were rejected: the schema has no Active Storage tables, and the mailer, locale, time zone, cookie rotator, and `SECRET_KEY_BASE` setup stay.
- Done: Rails 8.1.4. `load_defaults 8.1` turns YJIT off in development and test, stops escaping HTML in JSON responses, raises on path-relative redirects such as `redirect_to "example.com"`, and raises when an order-dependent finder has no order column to fall back on. `config.active_support.to_time_preserves_timezone` is deprecated and is no longer set; `to_time` still keeps the time zone. `app:update` also offered `bin/ci`, `bin/dev`, and `config/ci.rb`. Those were not kept: this app has no importmap, and CI stays in GitHub Actions. Devise 4.9.4 still passes a hash to `resource` for registrations. Rails warns that support ends in 8.2. Leave Devise on 4.9 until that is a deliberate bump.

In production, turn on `config.force_ssl = true` and, from Rails 7.1 on, `config.assume_ssl = true`. Railway terminates TLS in front of the container.

## 4. Leave the Vue app on a bundler

Do not rewrite Vue 2 as part of this. The layout loads Sprockets assets and a Shakapacker pack (`javascript_pack_tag` / `stylesheet_pack_tag` in `app/views/layouts/application.html.erb`). `javascript_pack_tag` is called with `defer: false` so inline page scripts still see the pack's globals.

Done: `webpacker` is replaced by Shakapacker 10.3.2. Node is 22.23.3 in `.tool-versions` and `package.json`. The pack stays in `app/javascript`, Vue 2 single-file components still use `vue-loader` 15, and `.js.erb` files still go through `rails-erb-loader` (Shakapacker adds that loader when the package is installed; do not add a second copy). `javascript_transpiler` is `babel`. `css_modules_export_mode` is `default` so Vue style blocks keep a default export. `@rails/actioncable` and `@rails/activestorage` are 7.2.400. `@rails/ujs` stays on 7.1.600 because Rails stopped publishing that package. Sprockets still serves the Bootstrap 3 stylesheets. Propshaft can wait until after the app is deployed.

CI installs Node 22, Yarn 1.22.22, and compiles the pack before `rails test`. The request tests still stub the pack tags, so they do not need the manifest.

## 5. Point the database config at Railway

`config/database.yml` production still uses a fixed database name, user, and `SIMULA_DATABASE_PASSWORD`. Railway gives you `DATABASE_URL`. Change the production section to:

```yaml
production:
  <<: *default
  url: <%= ENV["DATABASE_URL"] %>
```

`config/cable.yml` can stay as it is. Add a Postgres service and a Redis service in the Railway project, then set `DATABASE_URL` and `REDIS_URL` as reference variables (`${{Postgres.DATABASE_URL}}`, `${{Redis.REDIS_URL}}`). Postgres 16 or 17 is fine. Postgres 9.4 is not required.

## 6. Add a production Dockerfile

Use the Rails 8 Dockerfile as the base, with three changes this app needs:

- A Node 22 and Yarn stage, because `assets:precompile` has to compile the Vue pack. Install `libpq` and a C toolchain so `pg` and `sassc` can build.
- Precompile with `SECRET_KEY_BASE_DUMMY=1` so the image build does not need the real secret.
- Start Puma from `config/puma.rb`. It already binds `ENV["PORT"]`, which is what Railway sets. The stock Rails image listens on port 80 via Thruster, and that will not match Railway unless Thruster is reconfigured.

Also set `config.public_file_server.enabled = true` in production, or set `RAILS_SERVE_STATIC_FILES=1`. There is no nginx in front of this container. Set `RAILS_LOG_TO_STDOUT=1`.

Put migrations in a Railway pre-deploy command, `bundle exec rails db:prepare`, so they run once per deploy rather than inside every web process.

Environment variables to set on the service:

- `RAILS_ENV=production`
- `SECRET_KEY_BASE`
- `DATABASE_URL`, `REDIS_URL`
- `POSTMARK_KEY`, `EMAIL_FROM_ADDRESS`, `APP_HOST_URL` (the public Railway domain)
- `SENTRY_SERVER_URL`, `SENTRY_CLIENT_URL` if Sentry stays
- `RAILS_LOG_TO_STDOUT`, `RAILS_SERVE_STATIC_FILES`

`config/application.example.yml` is only a local template. Put those values in Railway’s variable editor, and if the Postmark token in that example file was ever a real key, rotate it.

## Order of work

1. Baseline on 2.7 / 6.1.
2. Done: Ruby 3.1.7, still on Rails 6.1.7.10, and the gem bumps above.
3. Done: Rails 7.2.4 with `config.load_defaults 7.2`. `paranoia` is 3.1. `db/schema.rb` stays `ActiveRecord::Schema[6.1]` so existing `serial` keys keep their old column defaults. `pg` stays on 1.5. `secrets.yml` is removed. Production has `force_ssl` and `assume_ssl`. Active Storage update migrations were not copied: the schema has no Active Storage tables.
4. Done: Shakapacker 10.3.2 and Node 22.23.3.
5. Done: Ruby 3.4.11, Rails 8.0.5.1, then Rails 8.1.4 with `config.load_defaults 8.1`.
6. `DATABASE_URL`, Dockerfile, Railway Postgres and Redis, env vars, pre-deploy `db:prepare`.

Start the Dockerfile only after `bundle install` and `rails assets:precompile` succeed locally on Ruby 3.4 and Rails 8.1.
