require 'test_helper'

class VariablesControllerTest < ActionDispatch::IntegrationTest
  test 'POST redirects guests to the sign-in page' do
    post project_variables_path(projects(:secret)), params: variable_params

    assert_redirected_to new_user_session_path
  end

  test 'POST is denied to a non-member' do
    sign_in users(:outsider)

    assert_no_difference 'Variable.count' do
      post project_variables_path(projects(:secret)), params: variable_params
    end

    assert_response :unauthorized
  end

  test 'POST creates a number variable for a project editor' do
    sign_in users(:editor)

    assert_difference 'Variable.count', 1 do
      post project_variables_path(projects(:secret)), params: variable_params
    end

    variable = projects(:secret).variables.find_by!(name: 'energia')
    assert_redirected_to projects(:secret)
    assert variable.number?
    assert_equal '3', variable.initial_value
  end

  test 'POST with a blank initial value re-renders the form' do
    sign_in users(:editor)

    assert_no_difference 'Variable.count' do
      post project_variables_path(projects(:secret)), params: {
        variable: { name: 'energia', data_type: 'number', initial_value: '' }
      }
    end

    assert_response :success
    assert_select 'h2', 'Nova variável'
  end

  test 'PATCH rename rewrites variable tokens in rules and the stop condition' do
    sign_in users(:editor)
    project = projects(:secret)
    variable = project.variables.create!(name: 'energia', data_type: :number, initial_value: '3')
    agent = project.agents.create!(name: 'Formiga', perception_area: 1)
    rule = agent.rules.create!(
      name: 'Gastar energia',
      priority: 1,
      action: {
        'type' => 'function_call',
        'input' => { 'expression' => '[energia]' },
        'input_types' => { 'expression' => 'string' }
      }
    )
    project.update!(stop_condition: { 'note' => 'para quando [energia] acabar' })

    patch project_variable_path(project, variable), params: {
      variable: { name: 'forca', data_type: 'number', initial_value: '3' }
    }

    assert_redirected_to project
    assert_equal '[forca]', rule.reload.action['input']['expression']
    assert_equal 'para quando [forca] acabar', project.reload.stop_condition['note']
  end

  test 'DELETE removes an unused variable' do
    sign_in users(:editor)
    variable = projects(:secret).variables.create!(name: 'livre', data_type: :number, initial_value: '1')

    assert_difference 'Variable.count', -1 do
      delete project_variable_path(projects(:secret), variable)
    end

    assert_redirected_to projects(:secret)
  end

  test 'DELETE of a variable used by a rule renders the warning and keeps it' do
    sign_in users(:editor)
    project = projects(:secret)
    variable = project.variables.create!(name: 'energia', data_type: :number, initial_value: '3')
    agent = project.agents.create!(name: 'Formiga', perception_area: 1)
    agent.rules.create!(
      name: 'Gastar energia',
      priority: 1,
      action: {
        'type' => 'function_call',
        'input' => { 'expression' => '[energia]' },
        'input_types' => { 'expression' => 'string' }
      }
    )

    assert_no_difference 'Variable.count' do
      delete project_variable_path(project, variable)
    end

    assert_response :success
    assert_match 'não pode ser excluída', response.body
    assert variable.reload.persisted?
  end

  private
    def variable_params
      { variable: { name: 'energia', data_type: 'number', initial_value: '3' } }
    end
end
