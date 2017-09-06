(function (global) {
  'use strict'

  function getAdjacentCoordinates(env, x, y, radius = 1, findFunction) {
    let z = 2 * radius + 1
    let _x = 0, _y = 0, dx = 0, dy = -1
    let coordinates = []

    // generate coordinates in spiral, based on
    // https://stackoverflow.com/questions/398299/looping-in-a-spiral
    for (let i = 0, j = Math.pow(z, 2); i < j; i++) {
      if (i > 0) {
        let px = _x + x
        let py = _y + y

        // is this coordinate in the stage?
        if (px >= 0 && py >= 0 && px < env.stageSize && py < env.stageSize) {
          let xy = { x: px, y: py }

          // if we have a findFunction, we check the coordinate against this function
          // and return the coordinate if it returns true
          if (findFunction && findFunction(px, py)) {
            return xy
          }

          coordinates.push(xy)
        }
      }

      if (_x === _y || (_x < 0 && _x === -_y) || (_x > 0 && _x === 1 - _y)) {
        [dx, dy] = [-dy, dx]
      }

      _x = _x + dx
      _y = _y + dy
    }

    // if we have a findFunction and no coordinates fit, we return null,
    // otherwise we return an array with the spiral of coordinates
    return findFunction ? null : coordinates
  }

  global.simulationFunctions = {
    value_comparison: {
      order: 1,
      type: 'condition',
      label: 'Comparar variável com valor',
      input: [
        {
          name: 'variable_id',
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
        let variable = env.variables[input.variable_id]

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
          name: 'variable1_id',
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
          name: 'variable2_id',
          type: 'variable',
          label: 'Qual variável?',
          defaultValue: null,
          nullLabel: 'Selecione a variável',
          required: true
        },
      ],
      definition: (env, agent, input) => {
        let variable1 = env.variables[input.variable1_id]
        let variable2 = env.variables[input.variable2_id]

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
        let coordinateWithAgent = getAdjacentCoordinates(
          env,
          agent.position.x,
          agent.position.y,
          agent.definition.perception_area,
          (x, y) => {
            let position = env.positions[y][x]
            return position && position.agent.definition.id === input.agent_id
          }
        )

        return Boolean(coordinateWithAgent)
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
        },
        {
          name: 'allow_diagonal',
          type: 'boolean',
          label: 'Permitir diagonal?',
          defaultValue: false,
          required: true
        }
      ],
      definition: (env, agent, input) => {
        let coordinateWithAgent = getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, (x, y) => {
          if (!input.allow_diagonal && (x !== agent.position.x || y !== agent.position.y)) {
            return false
          }

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
      input: [
        {
          name: 'allow_diagonal',
          type: 'boolean',
          label: 'Permitir diagonal?',
          defaultValue: false,
          required: true
        }
      ],
      definition: (env, agent, input) => {
        let adjacentCoordinates = getAdjacentCoordinates(env, agent.position.x, agent.position.y)
        let freeAdjacentCoordinates = adjacentCoordinates.filter(c => !env.positions[c.y][c.x])

        if (!input.allow_diagonal) {
          freeAdjacentCoordinates = freeAdjacentCoordinates.filter(c => c.x === agent.position.x || c.y === agent.position.y)
        }

        let randomCoordinate = _.sample(freeAdjacentCoordinates)

        if (randomCoordinate) {
          env.moveAgent(agent, randomCoordinate.x, randomCoordinate.y)
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
        },
        {
          name: 'allow_diagonal',
          type: 'boolean',
          label: 'Permitir diagonal?',
          defaultValue: false,
          required: true
        }
      ],
      definition: (env, agent, input) => {
        let coordinateWithAgent = getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, (x, y) => {
          if (!input.allow_diagonal && (x !== agent.position.x || y !== agent.position.y)) {
            return false
          }

          let position = env.positions[y][x]
          return position && position.agent.definition.id === input.agent_id
        })

        if (coordinateWithAgent) {
          let agent = env.positions[coordinateWithAgent.y][coordinateWithAgent.x].agent
          env.killAgent(agent)
        }
      }
    }
  }
})(window)
