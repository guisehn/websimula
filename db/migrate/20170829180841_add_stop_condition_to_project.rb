class AddStopConditionToProject < ActiveRecord::Migration[5.0]
  def change
    add_column :projects, :stop_condition, :jsonb
  end
end
