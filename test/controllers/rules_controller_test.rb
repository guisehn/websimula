require 'test_helper'

class RulesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @agent = projects(:secret).agents.create!(name: 'Formiga', perception_area: 1)
  end

  test 'POST creates a rule from JSON condition and action' do
    sign_in users(:editor)

    assert_difference 'Rule.count', 1 do
      post project_agent_rules_path(projects(:secret), @agent), params: {
        rule: rule_params
      }
    end

    rule = @agent.rules.find_by!(name: 'Andar')
    assert_redirected_to edit_project_agent_path(projects(:secret), @agent)
    assert_equal 'function_call', rule.condition['type']
    assert_equal 'function_call', rule.action['type']
  end

  test 'POST with a blank name re-renders the form' do
    sign_in users(:editor)

    assert_no_difference 'Rule.count' do
      post project_agent_rules_path(projects(:secret), @agent), params: {
        rule: rule_params.merge(name: '')
      }
    end

    assert_response :success
    assert_select 'h2', 'Nova regra'
  end

  test 'POST is denied to a non-member' do
    sign_in users(:outsider)

    assert_no_difference 'Rule.count' do
      post project_agent_rules_path(projects(:secret), @agent), params: {
        rule: rule_params
      }
    end

    assert_response :unauthorized
  end

  test 'DELETE removes the rule' do
    sign_in users(:editor)
    rule = @agent.rules.create!(name: 'Andar', priority: 1)

    assert_difference 'Rule.count', -1 do
      delete project_agent_rule_path(projects(:secret), @agent, rule)
    end

    assert_redirected_to edit_project_agent_path(projects(:secret), @agent)
  end

  test 'POST refuses to attach the rule to an agent on a project the user cannot edit' do
    sign_in users(:editor)
    other = projects(:open).agents.create!(name: 'Alheio', perception_area: 1)

    assert_no_difference 'Rule.count' do
      post project_agent_rules_path(projects(:secret), @agent), params: {
        rule: rule_params.merge(agent_id: other.id)
      }
    end

    assert_response :success
  end

  private
    def rule_params
      {
        name: 'Andar',
        priority: 1,
        condition: { type: 'function_call', input: {}, input_types: {} }.to_json,
        action: { type: 'function_call', input: {}, input_types: {} }.to_json
      }
    end
end
