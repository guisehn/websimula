class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  attr_accessor :edited_by

  after_create_commit { broadcast_change 'create', self }
  after_update_commit { broadcast_change 'update', self }
  after_destroy_commit { broadcast_change 'destroy', self }

  def associated_project_id
    if is_a?(Project)
      id
    elsif has_attribute?(:project_id)
      project_id
    elsif has_attribute?(:agent_id)
      agent.project_id
    else
      nil
    end
  end

  private
    def broadcast_change(action, instance)
      return unless associated_project_id

      data = {
        action: action,
        model: instance.class.name,
        id: instance.id,
        changes: previous_changes.keys,
      }

      if edited_by.present?
        data[:edited_by] = { id: edited_by.id, name: edited_by.name }
      end

      ActionCable.server.broadcast "project_#{associated_project_id}", data
    end
end
