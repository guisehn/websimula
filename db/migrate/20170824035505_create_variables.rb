class CreateVariables < ActiveRecord::Migration[5.0]
  def change
    create_table :variables do |t|
      t.integer :project_id
      t.integer :data_type
      t.string :name
      t.string :initial_value

      t.timestamps
    end
  end
end
