class AddParentProjectIdToProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :parent_project_id, :integer
  end
end
