# web simula

## Dependencies

- Ruby 2.7
- Rails 6
- PostgreSQL 9.4
- node.js v8.16.0 + yarn
- Redis 3.0.5

## External services

- [Postmark](https://postmarkapp.com/) for sending e-mails
- [Sentry](https://sentry.io/) for error tracking (both client and server-side)

## Development environment setup instructions

- Install the dependencies above
- Create a copy of `config/application.example.yml` and rename it to `config/application.yml`, update the content with real values
- Open the project folder in your terminal
- Run `yarn install` to install the JavaScript dependencies
- Run `bundle install` to install the Ruby gems
- Run `rails db:create` to create the local development database
- Run `rails db:schema:load` to create the database tables

### Starting up local server

Run `rails s` to start the server.

### REPL

Run `rails c` to access the Rails console.

### Automated testing

Run `rails test` to run automated tests for the server.

## Production deployment

For production deployment refer to the wiki page: [Deploying Web Simula in Production](https://github.com/guisehn/websimula/wiki/Deploying-Web-Simula-in-Production).
