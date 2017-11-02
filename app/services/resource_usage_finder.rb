class ResourceUsageFinder
  def initialize(project, resource)
    @project = project
    @resource = resource
  end

  def find
    rules = find_rules
    stop_condition = in_object?(@project.stop_condition)

    OpenStruct.new({
      found: rules.length > 0 || stop_condition,
      rules: rules,
      stop_condition: stop_condition
    })
  end

  def resource_type
    @resource.class.name.downcase
  end

  def find_rules
    Rule
      .unscoped
      .for_project(@project)
      .includes(:agent)
      .order('agents.name asc, rules.priority asc, rules.name asc')
      .select do |rule|
        in_object?(rule.condition) || in_object?(rule.action)
      end
  end

  def in_object?(obj)
    if obj.nil?
      false
    elsif obj.is_a?(Array)
      obj.any? { |item| in_object?(item) }
    elsif obj['type'] == 'logical_operator'
      in_object?(obj['children'])
    elsif obj['type'] == 'function_call' || obj.has_key?('function')
      in_function_call?(obj)
    end
  end

  def in_function_call?(obj)
    input_types = obj['input_types'] || {}
    inputs_of_type = input_types.select { |key, value| value == resource_type }.keys

    inputs = obj['input'] || {}
    inputs_used = inputs.any? { |key, value| inputs_of_type.include?(key) && value.to_i == @resource.id }

    # checks for [Variable name] inclusion
    if resource_type == 'variable' && !inputs_used
      inputs_used = inputs.any? { |key, value| value.is_a?(String) && value.include?("[#{@resource.name}]") }
    end

    inputs_used
  end
end
