class AddSystemRoleToUsers < ActiveRecord::Migration[5.0]
  def change
    add_column :users, :system_role, :integer, default: 0, null: false
  end
end
