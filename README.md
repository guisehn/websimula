# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

---

## When deploying to Heroku

1. Remember to set up Redis

2. Set buildpack order (as in https://github.com/rails/webpacker/issues/739). Run the following commands:

```
heroku buildpacks:clear
heroku buildpacks:set heroku/nodejs
heroku buildpacks:add heroku/ruby
```
