require 'test_helper'

class SimulationsControllerTest < ActionDispatch::IntegrationTest
  test 'GET new is available to a project member' do
    sign_in users(:member)

    get new_project_simulation_path(projects(:secret))

    assert_response :success
  end

  test 'GET new is denied to a non-member' do
    sign_in users(:outsider)

    get new_project_simulation_path(projects(:secret))

    assert_response :unauthorized
  end

  test 'GET new is denied to a guest' do
    get new_project_simulation_path(projects(:secret))

    assert_response :unauthorized
  end
end
