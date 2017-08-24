class CreateAgents < ActiveRecord::Migration[5.0]
  def change
    create_table :agents do |t|
      t.string :name
      t.integer :perception_area
      t.text :image
      t.integer :project_id

      t.timestamps
    end
  end
end
