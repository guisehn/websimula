json.extract! @project, :id, :name, :stop_condition, :initial_positions, :visibility, :created_at, :updated_at

json._visibility_label project_visibility(@project)

json.agents @project.agents do |agent|
  json.extract! agent, :id, :name, :perception_area, :image, :created_at, :updated_at

  json.rules agent.rules do |rule |
    json.extract! rule, :id, :name, :priority, :condition, :action, :created_at, :updated_at
  end
end

json.variables @project.variables do |variable|
  json.extract! variable, :id, :name, :data_type, :initial_value, :created_at, :updated_at
end
