# web simula

## Dependencies

- Ruby 2.2.2
- Rails 5.0.0
- PostgreSQL 9.4
- node.js v6.7.0
- Redis 3.0.5

## External services

- [Postmark](https://postmarkapp.com/) for sending e-mails
- [Sentry](https://sentry.io/) for error tracking (both client and server-side)

## Dev environment setup instructions

- Install the dependencies above
- Create a copy of `config/application.example.yml` and rename it to `config/application.yml`, update the content with the real values
- Open the project folder in your terminal
- Run `bundle install` to install the gems
- Run `rails db:create` to create the local development database
- Run `rails db:schema:load` to create the database tables

## Starting up local server

Run `rails s` to start the server.

## REPL

Run `rails c` to access the Rails console.

## Automated testing

Run `rails test` to run the server automated tests.

TODO:
- Increase server-side test coverage
- There's no automated tests for the client code yet.

## Production deployment

For production deployment refer to the wiki page: [Deploying Web Simula in Production](https://github.com/guisehn/websimula/wiki/Deploying-Web-Simula-in-Production).
