class CreateRules < ActiveRecord::Migration[5.0]
  def change
    create_table :rules do |t|
      t.integer :agent_id
      t.string :name
      t.integer :priority
      t.jsonb :condition
      t.jsonb :action

      t.timestamps
    end
  end
end
