'use strict'

window.simulationFunctions = {
  value_comparison: {
    order: 1,
    type: 'condition',
    label: 'Comparar variável com valor',
    input: [
      {
        name: 'variable',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        nullLabel: 'Selecione a variável',
        required: true
      },
      {
        name: 'comparison',
        type: 'string',
        label: 'Comparação',
        defaultValue: '=',
        required: true,
        options: [
          { value: '=', label: 'É igual a' },
          { value: '!=', label: 'É diferente de' },
          { value: '>', label: 'É maior que' },
          { value: '>=', label: 'É maior ou igual que' },
          { value: '<', label: 'É menor que' },
          { value: '<=', label: 'É menor ou igual a' }
        ]
      },
      {
        name: 'value',
        type: 'string',
        label: 'Qual valor?',
        defaultValue: '',
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let variable = env.variables[input.variable]

      switch (input.comparison) {
        case '=':  return variable.value == input.value
        case '!=': return variable.value != input.value
        case '>':  return variable.value > input.value
        case '>=': return variable.value >= input.value
        case '<':  return variable.value < input.value
        case '<=': return variable.value <= input.value
      }
    }
  },

  variable_comparison: {
    order: 2,
    type: 'condition',
    label: 'Comparar variável com variável',
    input: [
      {
        name: 'variable1',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        nullLabel: 'Selecione a variável',
        required: true
      },
      {
        name: 'comparison',
        type: 'string',
        label: 'Comparação',
        defaultValue: '=',
        required: true,
        options: [
          { value: '=', label: 'É igual a' },
          { value: '!=', label: 'É diferente de' },
          { value: '>', label: 'É maior que' },
          { value: '>=', label: 'É maior ou igual que' },
          { value: '<', label: 'É menor que' },
          { value: '<=', label: 'É menor ou igual a' }
        ]
      },
      {
        name: 'variable2',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        nullLabel: 'Selecione a variável',
        required: true
      },
    ],
    definition: (env, agent, input) => {
      let variable1 = env.variables[input.variable1]
      let variable2 = env.variables[input.variable2]

      switch (input.comparison) {
        case '=':  return variable1.value == variable2.value
        case '!=': return variable1.value != variable2.value
        case '>':  return variable1.value > variable2.value
        case '>=': return variable1.value >= variable2.value
        case '<':  return variable1.value < variable2.value
        case '<=': return variable1.value <= variable2.value
      }
    }
  },

  perceive_agent: {
    order: 3,
    type: 'condition',
    label: 'Perceber agente',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Qual agente?',
        defaultValue: null,
        nullLabel: 'Qualquer agente',
        required: false
      }
    ],
    definition: (env, agent, input) => {
      return false
    }
  },

  touch_agent: {
    order: 4,
    type: 'condition',
    label: 'Atinge agente',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Qual agente?',
        defaultValue: null,
        nullLabel: 'Qualquer agente',
        required: false
      }
    ],
    definition: (env, agent, input) => {
      let coordinateWithAgent = env._getAdjacentCoordinates(agent.position.x, agent.position.y, 1, (x, y) => {
        let position = env.positions[y][x]
        return position && position.agent.definition.id === input.agent_id
      })

      return Boolean(coordinateWithAgent)
    }
  },

  move_random: {
    order: 1,
    type: 'action',
    label: 'Mover aleatoriamente',
    input: [],
    definition: (env, agent, input) => {
      let adjacentCoordinates = env._getAdjacentCoordinates(agent.position.x, agent.position.y)
      let freeAdjacentCoordinates = adjacentCoordinates.filter(c => !env.positions[c.y][c.x])
      let randomCoordinate = _.sample(freeAdjacentCoordinates)

      if (randomCoordinate) {
        env._moveAgent(agent, randomCoordinate.x, randomCoordinate.y)
      }
    }
  },

  kill_agent: {
    order: 2,
    type: 'action',
    label: 'Matar agente',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Qual agente?',
        defaultValue: null,
        nullLabel: 'Qualquer agente',
        required: false
      }
    ],
    definition: (env, agent, input) => {
      let coordinateWithAgent = env._getAdjacentCoordinates(agent.position.x, agent.position.y, 1, (x, y) => {
        let position = env.positions[y][x]
        return position && position.agent.definition.id === input.agent_id
      })

      if (coordinateWithAgent) {
        let agent = env.positions[coordinateWithAgent.y][coordinateWithAgent.x].agent
        env._killAgent(agent)
      }
    }
  },
}
