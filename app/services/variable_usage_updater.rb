class VariableUsageUpdater
  def initialize(project, old_name, new_name, editor)
    @project = project
    @old_name = old_name
    @new_name = new_name
    @editor = editor
  end

  def update
    ActiveRecord::Base.transaction do
      update_rules
      update_stop_condition
    end
  end

  private
    def update_rules
      old_like = variable_sql_like(@old_name)

      rules = Rule
        .for_project(@project)
        .select('rules.*, condition::text as condition_text, action::text as action_text')
        .where('condition::text ilike ? or action::text ilike ?', old_like, old_like)

      rules.each do |rule|
        rule.edited_by = @editor

        if rule.condition_text.present? && rule.condition_text.include?(old_replacement)
          rule.condition = replace_name(rule.condition_text)
        end

        if rule.action_text.present? && rule.action_text.include?(old_replacement)
          rule.action = replace_name(rule.action_text)
        end

        rule.save!
      end
    end

    def update_stop_condition
      stop_condition_text = Project
        .select('projects.*, stop_condition::text as stop_condition_text')
        .find(@project.id)
        .stop_condition_text

      if stop_condition_text.present? && stop_condition_text.include?(old_replacement)
        @project.edited_by = @editor
        @project.stop_condition = replace_name(stop_condition_text)
        @project.save!
      end
    end

    def old_replacement
      @old_replacement ||= variable_replacement(@old_name)
    end

    def new_replacement
      @new_replacement ||= variable_replacement(@new_name)
    end

    def variable_replacement(var_name)
      "[#{var_name}]"
    end

    def variable_sql_like(var_name)
      "%#{variable_replacement(var_name)}%"
    end

    def replace_name(value)
      ActiveSupport::JSON.decode(value.gsub(old_replacement, new_replacement))
    end
end
