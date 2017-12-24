require 'test_helper'

class ResourceUsageFinderTest < ActiveSupport::TestCase
  project = Project.new
  resource = Agent.new(id: 5)
  finder = ResourceUsageFinder.new(project, resource)

  test "#in_function_call? should return true if resource is being used" do
    obj = {
      'type' => 'function_call',
      'input' => { 'x' => 5, 'y' => 2 },
      'input_types' => { 'x' => 'agent', 'y' => 'number' }
    }

    assert finder.in_function_call?(obj)
  end

  test "#in_function_call? should return false if resource is not being used" do
    obj = {
      'type' => 'function_call',
      'input' => { 'x' => 2, 'y' => 5 },
      'input_types' => { 'x' => 'agent', 'y' => 'number' }
    }

    assert_not finder.in_function_call?(obj)
  end

  test "#in_object? should return true if it's found in an array" do
    obj = [
      {
        'type' => 'function_call',
        'input' => { 'x' => 2, 'y' => 5 },
        'input_types' => { 'x' => 'number', 'y' => 'number' }
      },
      {
        'type' => 'function_call',
        'input' => { 'x' => 5, 'y' => 2 },
        'input_types' => { 'x' => 'agent', 'y' => 'number' }
      }
    ]

    assert finder.in_object?(obj)
  end

  test "#in_object? should return false if it's not found in an array" do
    obj = [
      {
        'type' => 'function_call',
        'input' => { 'x' => 2, 'y' => 5 },
        'input_types' => { 'x' => 'number', 'y' => 'number' }
      },
      {
        'type' => 'function_call',
        'input' => { 'x' => 2, 'y' => 5 },
        'input_types' => { 'x' => 'agent', 'y' => 'number' }
      }
    ]

    assert_not finder.in_object?(obj)
  end

  test "#in_object? should return true if it's inside a condition object" do
    obj = {
      'type' => 'logical_operator',
      'children' => [
        {
          'type' => 'logical_operator',
          'children' => [
            {
              'type' => 'function_call',
              'input' => { 'x' => 2, 'y' => 5 },
              'input_types' => { 'x' => 'number', 'y' => 'number' }
            },
            {
              'type' => 'function_call',
              'input' => { 'x' => 5, 'y' => 2 },
              'input_types' => { 'x' => 'agent', 'y' => 'number' }
            }
          ]
        }
      ]
    }

    assert finder.in_object?(obj)
  end

  test "#in_object? should return false if it's not inside a condition object" do
    obj = {
      'type' => 'logical_operator',
      'children' => [
        {
          'type' => 'logical_operator',
          'children' => [
            {
              'type' => 'function_call',
              'input' => { 'x' => 2, 'y' => 5 },
              'input_types' => { 'x' => 'number', 'y' => 'number' }
            },
            {
              'type' => 'function_call',
              'input' => { 'x' => 2, 'y' => 5 },
              'input_types' => { 'x' => 'agent', 'y' => 'number' }
            }
          ]
        }
      ]
    }

    assert_not finder.in_object?(obj)
  end
end
