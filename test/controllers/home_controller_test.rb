require 'test_helper'

class HomeControllerTest < ActionDispatch::IntegrationTest
  test 'GET / redirects guests to the sign-in page' do
    get root_path

    assert_redirected_to new_user_session_path
  end

  test 'GET / redirects signed-in users to their projects' do
    sign_in users(:member)

    get root_path

    assert_redirected_to projects_path
  end

  test 'GET /robots.txt is empty unless indexing is disabled' do
    get '/robots.txt'

    assert_response :success
    assert_equal '', response.body

    ENV['ROBOTS_NOINDEX'] = '1'
    get '/robots.txt'

    assert_response :success
    assert_equal "User-Agent: *\nDisallow: /", response.body
  ensure
    ENV.delete('ROBOTS_NOINDEX')
  end
end
