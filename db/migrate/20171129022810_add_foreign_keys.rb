class AddForeignKeys < ActiveRecord::Migration[5.0]
  def change
    add_foreign_key :agents, :projects

    add_foreign_key :audits, :users

    add_foreign_key :project_invites, :projects
    add_foreign_key :project_invites, :users, column: :inviter_id
    add_foreign_key :project_invites, :users, column: :registered_user_id

    add_foreign_key :project_users, :projects
    add_foreign_key :project_users, :users

    add_foreign_key :projects, :projects, column: :parent_project_id

    add_foreign_key :rules, :agents

    add_foreign_key :variables, :projects
  end
end
