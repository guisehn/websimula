class ProjectForkGenerator
  def initialize(project, user)
    @project = project
    @user = user
    @mapping = {}
  end

  def fork
    ActiveRecord::Base.transaction do
      copy_project
      copy_agents_and_rules
      copy_variables

      adjust_stop_condition
      adjust_initial_positions
      adjust_rules
    end

    @copy
  end

  private
    def copy_project
      @copy = @project.dup
      @copy.parent_project_id = @project.id
      @copy.name += ' (cópia)'
      @copy.visibility = :secret
      @copy.save!
      @copy.project_users.create!(user: @user, role: :admin)
    end

    def copy_variables
      @mapping[:variables] = {}

      @project.variables.each do |variable|
        variable_copy = variable.dup
        variable_copy.project_id = @copy.id
        variable_copy.save!

        @mapping[:variables][variable.id] = variable_copy.id
      end
    end

    def copy_agents_and_rules
      @mapping[:agents] = {}
      @mapping[:rules] = {}

      @project.agents.each do |agent|
        agent_copy = agent.dup
        agent_copy.project_id = @copy.id
        agent_copy.save!

        copy_rules(agent, agent_copy)

        @mapping[:agents][agent.id] = agent_copy.id
      end
    end

    def copy_rules(agent, agent_copy)
      agent.rules.each do |rule|
        rule_copy = rule.dup
        rule_copy.agent_id = agent_copy.id
        rule_copy.save!

        @mapping[:rules][rule.id] = rule_copy.id
      end
    end

    def adjust_stop_condition
      unless @copy.stop_condition.nil?
        @copy.stop_condition = adjust_object(@copy.stop_condition.dup)
        @copy.save!
      end
    end

    def adjust_initial_positions
      return if @copy.initial_positions.nil?

      new_fixed_positions = {}
      new_random_positions = {}

      fixed_positions = @copy.initial_positions['fixed_positions'] || {}
      fixed_positions.each do |agent_id, positions|
        new_fixed_positions[@mapping[:agents][agent_id.to_i]] = positions
      end

      random_positions = @copy.initial_positions['random_positions'] || {}
      random_positions.each do |agent_id, positions|
        new_random_positions[@mapping[:agents][agent_id.to_i]] = positions
      end

      @copy.initial_positions = {
        fixed_positions: new_fixed_positions,
        random_positions: new_random_positions
      }

      @copy.save!
    end

    def adjust_rules
      Rule.for_project(@copy).each do |rule|
        rule.condition = adjust_object rule.condition
        rule.action = adjust_object rule.action
        rule.save!
      end
    end

    def adjust_object(obj)
      unless obj.nil?
        if obj.is_a?(Array)
          obj.each { |item| adjust_object(item) }
        elsif obj['type'] == 'logical_operator'
          adjust_object obj['children']
        elsif obj['type'] == 'function_call' || obj.has_key?('function')
          input_types = obj['input_types'] || {}
          inputs = obj['input'] || {}

          inputs.each do |key, value|
            input_type = input_types[key]

            if input_type == 'agent'
              inputs[key] = @mapping[:agents][value.to_i]
            elsif input_type == 'variable'
              inputs[key] = @mapping[:variables][value.to_i]
            end
          end
        end
      end

      obj
    end
end
