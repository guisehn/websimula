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
    'perceived_agent_quantity_comparison',
    'perceive_agent',
    'perceive_clue',
    'touch_agent',
    'touch_clue',
    'reach_age'
  ],

  action: [
    'move_random',
    'move',
    'move_to_coordinate',
    'move_to_random_coordinate',
    'follow_agent',
    'follow_clue',
    'escape_from_agent',
    'kill_agent',
    'die',
    'transform',
    'set_age',
    'breed',
    'leave_clue',
    'remove_clue',
    'increment_variable',
    'decrement_variable',
    'set_variable',
    'set_random_value',
    'execute_next_rule'
  ]
}
