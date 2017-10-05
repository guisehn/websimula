class AddVisibilityToProjects < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :visibility, :integer, null: false, default: 0
  end
end
