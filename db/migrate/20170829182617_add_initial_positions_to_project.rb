class AddInitialPositionsToProject < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :initial_positions, :jsonb
  end
end
