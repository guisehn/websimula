require 'test_helper'

class ProjectsControllerTest < ActionDispatch::IntegrationTest
  test 'GET /projects redirects guests to the sign-in page' do
    get projects_path

    assert_redirected_to new_user_session_path
  end

  test 'GET /projects lists only the signed-in user projects' do
    sign_in users(:member)

    get projects_path

    assert_response :success
    assert_match projects(:secret).name, response.body
    assert_no_match projects(:open).name, response.body
  end

  test 'GET /projects/open lists public projects without a session' do
    get open_projects_path

    assert_response :success
    assert_match projects(:open).name, response.body
    assert_no_match projects(:secret).name, response.body
  end

  test 'GET /projects/tutorial succeeds without a session' do
    get tutorial_projects_path

    assert_response :success
  end

  test 'GET /projects/all is limited to system admins' do
    sign_in users(:member)
    get all_projects_path
    assert_response :unauthorized

    sign_in users(:admin)
    get all_projects_path
    assert_response :success
  end

  test 'secret project show is limited to members' do
    sign_in users(:member)
    get project_path(projects(:secret))
    assert_response :success

    sign_in users(:outsider)
    get project_path(projects(:secret))
    assert_response :unauthorized

    sign_out users(:outsider)
    get project_path(projects(:secret))
    assert_response :unauthorized
  end

  test 'open project show is public' do
    get project_path(projects(:open))

    assert_response :success
  end

  test 'POST /projects creates a project administered by the current user' do
    sign_in users(:member)

    assert_difference ['Project.count', 'ProjectUser.count'], 1 do
      post projects_path, params: { project: { name: 'Novo projeto' } }
    end

    project = Project.find_by!(name: 'Novo projeto')
    assert_redirected_to project
    assert project.project_users.find_by(user: users(:member), role: :admin)
  end

  test 'POST /projects with a blank name re-renders the form' do
    sign_in users(:member)

    assert_no_difference 'Project.count' do
      post projects_path, params: { project: { name: '' } }
    end

    assert_response :success
    assert_select 'h2', 'Novo projeto'
  end

  test 'PATCH name succeeds for a project admin' do
    sign_in users(:member)

    patch project_path(projects(:secret)), params: { project: { name: 'Renamed project' } }

    assert_redirected_to projects(:secret)
    assert_equal 'Renamed project', projects(:secret).reload.name
  end

  test 'PATCH name succeeds for a project editor' do
    sign_in users(:editor)

    patch project_path(projects(:secret)), params: { project: { name: 'Editor rename' } }

    assert_redirected_to projects(:secret)
  end

  test 'PATCH name is denied to a non-member' do
    sign_in users(:outsider)

    patch project_path(projects(:secret)), params: { project: { name: 'Hijacked' } }

    assert_response :unauthorized
    assert_equal 'Secret project', projects(:secret).reload.name
  end

  test 'DELETE soft-deletes a project for a project admin' do
    sign_in users(:member)

    assert_difference 'Project.count', -1 do
      delete project_path(projects(:secret))
    end

    assert_redirected_to projects_url
    assert Project.with_deleted.find(projects(:secret).id).deleted_at.present?
  end

  test 'DELETE soft-deletes a project for a system admin' do
    sign_in users(:admin)

    assert_difference 'Project.count', -1 do
      delete project_path(projects(:open))
    end

    assert_redirected_to projects_url
    assert Project.with_deleted.find(projects(:open).id).deleted_at.present?
  end

  test 'DELETE is denied to a project editor' do
    sign_in users(:editor)

    assert_no_difference 'Project.count' do
      delete project_path(projects(:secret))
    end

    assert_response :unauthorized
    assert_nil Project.with_deleted.find(projects(:secret).id).deleted_at
  end

  test 'POST fork copies the project for a member' do
    sign_in users(:member)
    existing_ids = Project.pluck(:id)

    assert_difference 'Project.count', 1 do
      post fork_project_path(projects(:secret))
    end

    copy = Project.where.not(id: existing_ids).first
    assert_redirected_to copy
    assert copy.project_users.find_by(user: users(:member), role: :admin)
    assert_equal "#{projects(:secret).name} (cópia)", copy.name
  end
end
