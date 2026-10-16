require 'test_helper'

class UsersControllerTest < ActionDispatch::IntegrationTest
  test 'POST adds an existing user as an editor' do
    sign_in users(:member)

    assert_difference 'ProjectUser.count', 1 do
      post project_users_path(projects(:secret)), params: {
        user: { email: users(:outsider).email }
      }
    end

    assert_response :success
    assert_equal 'added', JSON.parse(response.body)['result']
    assert projects(:secret).project_users.find_by(user: users(:outsider), role: :editor)
  end

  test 'POST rejects a user who is already a member' do
    sign_in users(:member)

    assert_no_difference 'ProjectUser.count' do
      post project_users_path(projects(:secret)), params: {
        user: { email: users(:editor).email }
      }
    end

    assert_response :bad_request
  end

  test 'POST invites an unknown email' do
    sign_in users(:member)

    assert_difference 'ProjectInvite.count', 1 do
      assert_emails 1 do
        post project_users_path(projects(:secret)), params: {
          user: { email: 'novo@example.com' }
        }
      end
    end

    assert_response :success
    assert_equal 'invited', JSON.parse(response.body)['result']
    invite = ProjectInvite.find_by!(email: 'novo@example.com')
    assert_equal users(:member), invite.inviter
    assert_equal projects(:secret), invite.project
    assert_equal ['novo@example.com'], ActionMailer::Base.deliveries.last.to
  end

  test 'POST is denied to a project editor' do
    sign_in users(:editor)

    assert_no_emails do
      assert_no_difference 'ProjectInvite.count' do
        post project_users_path(projects(:secret)), params: {
          user: { email: 'novo@example.com' }
        }
      end
    end

    assert_response :unauthorized
  end

  test 'DELETE removes a member' do
    sign_in users(:member)

    delete project_user_path(projects(:secret), users(:editor))

    assert_redirected_to edit_project_path(projects(:secret))
    assert_nil projects(:secret).project_users.find_by(user: users(:editor))
  end

  test 'DELETE removes an invite' do
    sign_in users(:member)
    invite = projects(:secret).project_invites.create!(
      email: 'novo@example.com',
      inviter: users(:member),
      role: :editor
    )

    delete project_user_path(projects(:secret), "invite:#{invite.id}")

    assert_redirected_to edit_project_path(projects(:secret))
    assert_nil ProjectInvite.find_by(id: invite.id)
  end
end
