require 'test_helper'

class AgentsControllerTest < ActionDispatch::IntegrationTest
  test 'POST creates an agent for a project editor' do
    sign_in users(:editor)

    assert_difference 'Agent.count', 1 do
      post project_agents_path(projects(:secret)), params: {
        agent: { name: 'Formiga', perception_area: 10 }
      }
    end

    agent = Agent.find_by!(name: 'Formiga')
    assert_redirected_to project_agent_path(projects(:secret), agent)
  end

  test 'POST is denied to a non-member' do
    sign_in users(:outsider)

    assert_no_difference 'Agent.count' do
      post project_agents_path(projects(:secret)), params: {
        agent: { name: 'Intruso', perception_area: 10 }
      }
    end

    assert_response :unauthorized
  end

  test 'GET show of an open project agent is public and redirects to edit' do
    agent = projects(:open).agents.create!(name: 'Público', perception_area: 10)

    get project_agent_path(projects(:open), agent)

    assert_redirected_to edit_project_agent_path(projects(:open), agent)
  end
end
