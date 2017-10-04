class CreateProjectInvites < ActiveRecord::Migration[5.0]
  def change
    create_table :project_invites do |t|
      t.string :code
      t.string :email
      t.integer :project_id
      t.integer :role
      t.integer :inviter_id
      t.integer :registered_user_id

      t.timestamps
    end
  end
end
