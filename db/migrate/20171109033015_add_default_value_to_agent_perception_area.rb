class AddDefaultValueToAgentPerceptionArea < ActiveRecord::Migration[5.0]
  def change
    change_column_default :agents, :perception_area, 10
  end
end
