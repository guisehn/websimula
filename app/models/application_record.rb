class ApplicationRecord < ActiveRecord::Base
  self.abstract_class = true

  after_create_commit { broadcast_change 'create', self }
  after_update_commit { broadcast_change 'update', self }
  after_destroy_commit { broadcast_change 'destroy', self }

  private
    def broadcast_change(action, instance)
      return unless instance.has_attribute?(:project_id)|| instance.is_a?(Project)

      project_id = instance.read_attribute(:project_id) || instance.id

      data = { action: action, model: instance.class.name, id: instance.id }
      ActionCable.server.broadcast "project_#{project_id}", data
    end
end
