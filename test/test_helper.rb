ENV['RAILS_ENV'] ||= 'test'
ENV['EMAIL_FROM_ADDRESS'] ||= 'from@example.com'
require File.expand_path('../../config/environment', __FILE__)
require 'rails/test_help'

class ActiveSupport::TestCase
  # Setup all fixtures in test/fixtures/*.yml for all tests in alphabetical order.
  fixtures :all

  # Add more helper methods to be used by all tests here...
end

# TODO: hack until we upgrade Node.js
module TestPackTags
  def javascript_pack_tag(*)
    ''.html_safe
  end

  def stylesheet_pack_tag(*)
    ''.html_safe
  end
end

ActionView::Base.prepend(TestPackTags)

class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end
