require 'test_helper'

class RegistrationsControllerTest < ActionDispatch::IntegrationTest
  test 'POST creates a user and signs them in' do
    assert_difference 'User.count', 1 do
      post user_registration_path, params: {
        user: signup_params
      }
    end

    assert_redirected_to root_path
    follow_redirect!
    assert_redirected_to projects_path
    assert User.find_by!(email: 'nova@example.com')
  end

  test 'POST with a blank name does not create a user' do
    assert_no_difference 'User.count' do
      post user_registration_path, params: {
        user: signup_params.merge(name: '')
      }
    end

    assert_response :success
  end

  test 'POST with an invite code joins the project as an editor' do
    invite = projects(:secret).project_invites.create!(
      email: 'convidado@example.com',
      inviter: users(:member),
      role: :editor
    )

    assert_difference ['User.count', 'ProjectUser.count'], 1 do
      post user_registration_path, params: {
        user: signup_params.merge(email: invite.email, invite: invite.code)
      }
    end

    user = User.find_by!(email: invite.email)
    assert projects(:secret).project_users.find_by(user: user, role: :editor)
    assert_equal user, ProjectInvite.unscoped.find(invite.id).registered_user
    assert_nil ProjectInvite.find_by(id: invite.id)
  end

  private
    def signup_params
      {
        name: 'Nova',
        email: 'nova@example.com',
        password: 'password',
        password_confirmation: 'password'
      }
    end
end
