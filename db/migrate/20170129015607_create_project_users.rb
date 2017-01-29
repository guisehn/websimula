class CreateProjectUsers < ActiveRecord::Migration[5.0]
  def change
    create_table :project_users do |t|
      t.integer :project_id, null: false
      t.integer :user_id, null: false
      t.integer :role, null: false

      t.timestamps
    end

    add_foreign_key :project_users, :projects
    add_foreign_key :project_users, :users
  end
end
