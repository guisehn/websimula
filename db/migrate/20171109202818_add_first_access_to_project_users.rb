class AddFirstAccessToProjectUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :project_users, :first_access, :boolean, null: false, default: true

    reversible do |dir|
      dir.up do
        ProjectUser.update_all(first_access: false)
      end
    end
  end
end
