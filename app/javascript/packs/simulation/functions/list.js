export default {
  condition: [
    'value_comparison',
    'variable_comparison',
    'agent_quantity_comparison',
    'check_coordinate_occupation'
  ],

  agent_condition: [
    'agent_x_coordinate_comparison',
    'agent_y_coordinate_comparison',
    'perceive_agent',
    'touch_agent',
    'reach_age'
  ],

  action: [
    'move_random',
    'move',
    'move_to_coordinate',
    'move_to_random_coordinate',
    'follow_agent',
    'escape_from_agent',
    'kill_agent',
    'die',
    'transform',
    'set_age',
    'breed',
    'increment_variable',
    'decrement_variable',
    'set_variable',
    'set_random_value',
    'execute_next_rule'
  ]
}
