require 'test_helper'

class SessionsControllerTest < ActionDispatch::IntegrationTest
  test 'POST signs in with the correct password and lands on the project list' do
    post user_session_path, params: {
      user: { email: users(:member).email, password: 'password' }
    }

    assert_redirected_to root_path
    follow_redirect!
    assert_redirected_to projects_path
  end

  test 'POST with a wrong password re-renders the sign-in page' do
    post user_session_path, params: {
      user: { email: users(:member).email, password: 'wrong-password' }
    }

    assert_response :success
    assert_select 'h2', 'Seja bem vindo!'
  end

  test 'DELETE signs the user out' do
    sign_in users(:member)

    delete destroy_user_session_path

    assert_redirected_to root_path
    follow_redirect!
    assert_redirected_to new_user_session_path
  end
end
