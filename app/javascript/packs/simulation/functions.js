import _ from 'lodash'

const global = window

const COMPARISON_OPTIONS = [
  { value: '=', label: 'É igual a' },
  { value: '!=', label: 'É diferente de' },
  { value: '>', label: 'É maior que' },
  { value: '>=', label: 'É maior ou igual que' },
  { value: '<', label: 'É menor que' },
  { value: '<=', label: 'É menor ou igual a' }
]

const DIRECTION_OPTIONS = [
  { value: 'N', label: 'Norte' },
  { value: 'S', label: 'Sul' },
  { value: 'E', label: 'Leste' },
  { value: 'W', label: 'Oeste' },
  { value: 'NE', label: 'Nordeste' },
  { value: 'NW', label: 'Noroeste' },
  { value: 'SE', label: 'Sudeste' },
  { value: 'SW', label: 'Sudoeste' }
]

function getAdjacentCoordinates(env, x, y, radius = 1, findFunctionReturnAll, findFunction) {
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
      if (isCoordinateInsideStage(env, px, py)) {
        let xy = { x: px, y: py }

        // if we have a findFunction, we check the coordinate against this function
        // and return the coordinate if it returns true
        if (findFunction) {
          let result = findFunction(px, py)

          if (result === false) {
            break
          }

          if (result) {
            if (findFunctionReturnAll) {
              coordinates.push(xy)
            } else {
              return xy
            }
          }
        } else {
          coordinates.push(xy)
        }
      }
    }

    if (_x === _y || (_x < 0 && _x === -_y) || (_x > 0 && _x === 1 - _y)) {
      [dx, dy] = [-dy, dx]
    }

    _x = _x + dx
    _y = _y + dy
  }

  return findFunction && !findFunctionReturnAll ? null : coordinates
}

function isCoordinateInsideStage(env, x, y) {
  return x >= 0 && y >= 0 && x < env.stageSize && y < env.stageSize
}

function isCoordinateOccupied(env, x, y) {
  return _.get(env.positions[y][x], 'type') === 'agent'
}

function isDiagonalBlocked(env, x1, y1, x2, y2) {
  return x1 !== x2 && y1 !== y2 && isCoordinateOccupied(env, x1, y2) && isCoordinateOccupied(env, x2, y1)
}

function generateCoordinateFromMovement(env, x, y, direction, steps = 1) {
  if (direction.indexOf('W') !== -1) x -= steps
  if (direction.indexOf('E') !== -1) x += steps

  if (direction.indexOf('N') !== -1) y -= steps
  if (direction.indexOf('S') !== -1) y += steps

  return ensureCoordinateIsInsideStage(env, x, y)
}

function ensureCoordinateIsInsideStage(env, x, y) {
  if (x < 0) {
    x = 0
  } else if (x >= env.stageSize) {
    x = env.stageSize - 1
  }

  if (y < 0) {
    y = 0
  } else if (y >= env.stageSize) {
    y = env.stageSize - 1
  }

  return { x: x, y: y }
}

// Simple path finder (gets stuck easily)
function simpleFindPathTo(env, agent, x, y) {
  let closerX = agent.position.x
  let closerY = agent.position.y

  if (x > agent.position.x) {
    ++closerX
  } else if (x < agent.position.x) {
    --closerX
  }

  if (y > agent.position.y) {
    ++closerY
  } else if (y < agent.position.y) {
    --closerY
  }

  let isHorizontalOccupied = isCoordinateOccupied(env, closerX, agent.position.y)
  let isVerticalOccupied = isCoordinateOccupied(env, agent.position.x, closerY)
  let isDiagonalOccupied = isCoordinateOccupied(env, closerX, closerY)

  if (!isDiagonalOccupied && (!isHorizontalOccupied || !isVerticalOccupied)) {
    return { x: closerX, y: closerY }
  }

  if (!isHorizontalOccupied) {
    return { x: closerX, y: agent.position.y }
  }

  if (!isVerticalOccupied) {
    return { x: agent.position.x, y: closerY }
  }

  return null
}

// A* path finder
function astarFindPathTo(env, agent, targetX, targetY) {
  let foundNodes = {}
  let openNodes = [{ x: agent.position.x, y: agent.position.y, isRoot: true }]
  let currentNode = openNodes[0]

  let calculateHeuristic = (x1, y1, x2, y2) => {
    let dx = Math.abs(x1 - x2)
    let dy = Math.abs(y1 - y2)
    let max = Math.max(dx, dy)
    let min = Math.min(dx, dy)
    return 14 * min + 10 * (max - min)
  }

  let getAdjacentNodes = (node) => {
    let adjacentCoordinates = getAdjacentCoordinates(env, node.x, node.y, 1, true, (x, y) => {
      if (x === targetX && y === targetY) return true
      if (!isCoordinateOccupied(env, x, y) && !isDiagonalBlocked(env, x, y, node.x, node.y) && !_.get(foundNodes, `${y}.${x}`)) return true
    })

    let adjacentNodes = adjacentCoordinates.map(coordinate => {
      let g = calculateHeuristic(coordinate.x, coordinate.y, agent.position.x, agent.position.y)
      let h = calculateHeuristic(coordinate.x, coordinate.y, targetX, targetY)
      let f = g + h

      return {
        x: coordinate.x,
        y: coordinate.y,
        parent: node,
        g, h, f
      }
    })

    return adjacentNodes
  }

  while (currentNode && currentNode.h !== 0 && openNodes.length) {
    // move current node from open -> closed
    _.remove(openNodes, currentNode)
    _.set(foundNodes, `${currentNode.y}.${currentNode.x}`, true)

    // generate adjacent nodes
    let adjacentNodes = getAdjacentNodes(currentNode)
    openNodes.push.apply(openNodes, adjacentNodes)
    adjacentNodes.forEach(node => _.set(foundNodes, `${node.y}.${node.x}`, true))

    // go to next node
    let next = _.minBy(openNodes, 'f')
    currentNode = next
  }

  // if we found the final node, let's get the first step taken
  if (currentNode) {
    while (!currentNode.parent.isRoot) {
      currentNode = currentNode.parent
    }

    return { x: currentNode.x, y: currentNode.y }
  }

  return null
}

function performComparison(value1, value2, comparer) {
  switch (comparer) {
    case '=':  return value1 == value2
    case '!=': return value1 != value2
    case '>':  return value1 > value2
    case '>=': return value1 >= value2
    case '<':  return value1 < value2
    case '<=': return value1 <= value2
  }
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
        required: true
      },
      {
        name: 'comparison',
        type: 'string',
        label: 'Comparação',
        hideLabel: true,
        defaultValue: '=',
        required: true,
        options: COMPARISON_OPTIONS
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
      return performComparison(variable.value, input.value, input.comparison)
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
        required: true
      },
      {
        name: 'comparison',
        type: 'string',
        label: 'Comparação',
        hideLabel: true,
        defaultValue: '=',
        required: true,
        options: COMPARISON_OPTIONS
      },
      {
        name: 'variable2_id',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let variable1 = env.variables[input.variable1_id]
      let variable2 = env.variables[input.variable2_id]
      return performComparison(variable1.value, variable2.value, input.comparison)
    }
  },

  agent_quantity_comparison: {
    order: 3,
    type: 'condition',
    label: 'Comparar quantidade de agentes',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Quantidade de agentes do tipo',
        defaultValue: null,
        required: true
      },
      {
        name: 'comparison',
        type: 'string',
        label: 'Comparação',
        hideLabel: true,
        defaultValue: '=',
        required: true,
        options: COMPARISON_OPTIONS
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
      let count = env.agents.filter(a => a.definition.id === input.agent_id).length
      return performComparison(count, input.value, input.comparison)
    }
  },

  check_coordinate_occupation: {
    order: 4,
    type: 'condition',
    label: 'Verificar se coordenada está ocupada',
    input: [
      {
        name: 'x',
        type: 'number',
        label: 'X (horizontal)',
        defaultValue: 1,
        required: true
      },
      {
        name: 'y',
        type: 'number',
        label: 'Y (vertical)',
        defaultValue: 1,
        required: true
      },
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Por qual agente?',
        defaultValue: null,
        nullLabel: 'Qualquer agente',
        required: false
      }
    ],
    definition: (env, agent, input) => {
      let x = input.x - 1
      let y = input.y - 1

      if (!isCoordinateOccupied(env, x, y)) {
        return false
      }

      return input.agent_id ? (env.positions[y][x].agent.definition.id == input.agent_id) : true
    }
  },

  agent_x_coordinate_comparison: {
    order: 5,
    type: 'agent_condition',
    label: 'Comparar coordenada X (horizontal) do agente',
    input: [
      {
        name: 'comparison',
        type: 'string',
        label: 'Coordenada X do agente',
        defaultValue: '=',
        required: true,
        options: COMPARISON_OPTIONS
      },
      {
        name: 'value',
        type: 'number',
        label: 'Coordenada X',
        hideLabel: true,
        defaultValue: '',
        required: true
      }
    ],
    definition: (env, agent, input) => {
      return performComparison(agent.position.x + 1, input.value, input.comparison)
    }
  },

  agent_y_coordinate_comparison: {
    order: 6,
    type: 'agent_condition',
    label: 'Comparar coordenada Y (vertical) do agente',
    input: [
      {
        name: 'comparison',
        type: 'string',
        label: 'Coordenada Y do agente',
        defaultValue: '=',
        required: true,
        options: COMPARISON_OPTIONS
      },
      {
        name: 'value',
        type: 'number',
        label: 'Coordenada Y',
        hideLabel: true,
        defaultValue: '',
        required: true
      }
    ],
    definition: (env, agent, input) => {
      return performComparison(agent.position.y + 1, input.value, input.comparison)
    }
  },

  perceive_agent: {
    order: 7,
    type: 'agent_condition',
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
        false,
        (x, y) => {
          let position = env.positions[y][x]

          if (position && (!input.agent_id || position.agent.definition.id === input.agent_id)) {
            return true
          }
        }
      )

      return Boolean(coordinateWithAgent)
    }
  },

  touch_agent: {
    order: 8,
    type: 'agent_condition',
    label: 'Atingir agente',
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
      let coordinateWithAgent = getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, false, (x, y) => {
        if (isDiagonalBlocked(env, x, y, agent.position.x, agent.position.y)) {
          return
        }

        let position = env.positions[y][x]

        if (position && (!input.agent_id || position.agent.definition.id === input.agent_id)) {
          return true
        }
      })

      return Boolean(coordinateWithAgent)
    }
  },

  reach_age: {
    order: 9,
    type: 'agent_condition',
    label: 'Atingir tempo de vida',
    input: [
      {
        name: 'age',
        type: 'number',
        label: 'Idade (em ciclos)',
        defaultValue: 0,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      return agent.age >= input.age
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

      if (input.allow_diagonal) {
        freeAdjacentCoordinates = freeAdjacentCoordinates.filter(c => !isDiagonalBlocked(env, agent.position.x, agent.position.y, c.x, c.y))
      } else {
        freeAdjacentCoordinates = freeAdjacentCoordinates.filter(c => c.x === agent.position.x || c.y === agent.position.y)
      }

      let randomCoordinate = _.sample(freeAdjacentCoordinates)

      if (randomCoordinate) {
        env.moveAgent(agent, randomCoordinate.x, randomCoordinate.y)
      }
    }
  },

  move: {
    order: 2,
    type: 'action',
    label: 'Mover em direção',
    input: [
      {
        name: 'direction',
        type: 'string',
        label: 'Direção',
        defaultValue: null,
        nullLabel: 'Escolha a direção',
        required: true,
        options: DIRECTION_OPTIONS
      },
      {
        name: 'steps',
        type: 'number',
        label: 'Quantidade de posições',
        required: true,
        defaultValue: 1
      },
      {
        name: 'try_smaller_step',
        type: 'boolean',
        label: 'Tentar movimento menor se espaço estiver ocupado',
        required: false,
        defaultValue: false
      }
    ],
    definition: (env, agent, input) => {
      let steps = input.steps

      while (steps > 0) {
        let coordinate = generateCoordinateFromMovement(env, agent.position.x, agent.position.y, input.direction, steps)
        let moved = false

        if (!isCoordinateOccupied(env, coordinate.x, coordinate.y)) {
          env.moveAgent(agent, coordinate.x, coordinate.y)
          break
        }

        if (input.try_smaller_step) {
          steps--
        } else {
          break
        }
      }
    }
  },

  move_to_coordinate: {
    order: 3,
    type: 'action',
    label: 'Mover para coordenada',
    input: [
      {
        name: 'x',
        type: 'number',
        label: 'X (horizontal)',
        defaultValue: 1,
        required: true
      },
      {
        name: 'y',
        type: 'number',
        label: 'Y (vertical)',
        defaultValue: 1,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let coordinate = ensureCoordinateIsInsideStage(env, input.x - 1, input.y - 1)

      if (!isCoordinateOccupied(env, coordinate.x, coordinate.y)) {
        env.moveAgent(agent, coordinate.x, coordinate.y)
      }
    }
  },

  follow_agent: {
    order: 4,
    type: 'action',
    label: 'Seguir agente',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Qual agente?',
        defaultValue: null,
        required: true
      },
      {
        name: 'mode',
        type: 'string',
        label: 'Modo',
        defaultValue: 'A*',
        options: [
          { value: 'A*', label: 'Inteligente (A*)' },
          { value: 'simple', label: 'Simples' },
        ],
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let moveTo = null

      let coordinateWithAgent = getAdjacentCoordinates(
        env,
        agent.position.x,
        agent.position.y,
        agent.definition.perception_area,
        false,
        (x, y) => {
          let position = env.positions[y][x]

          if (position && position.agent.definition.id === input.agent_id) {
            let findPathTo = input.mode === 'simple' ? simpleFindPathTo : astarFindPathTo
            moveTo = findPathTo(env, agent, x, y)
            if (moveTo) return true
          }
        }
      )

      if (coordinateWithAgent
        && !isCoordinateOccupied(env, moveTo.x, moveTo.y)
        && !isDiagonalBlocked(env, agent.position.x, agent.position.y, moveTo.x, moveTo.y)) {
        env.moveAgent(agent, moveTo.x, moveTo.y)
      }
    }
  },

  escape_from_agent: {
    order: 5,
    type: 'action',
    label: 'Escapar de agente',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Qual agente?',
        defaultValue: null,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      // TODO: implement this
      return simulationFunctions.move_random.definition(env, agent, input)
    }
  },

  kill_agent: {
    order: 6,
    type: 'action',
    label: 'Matar agente',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Qual agente?',
        defaultValue: null,
        nullLabel: 'Qualquer agente',
        required: false,
      }
    ],
    definition: (env, agent, input) => {
      let coordinateWithAgent = getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, false, (x, y) => {
        if (isDiagonalBlocked(env, x, y, agent.position.x, agent.position.y)) {
          return
        }

        let position = env.positions[y][x]

        if (position && (!input.agent_id || position.agent.definition.id === input.agent_id)) {
          return true
        }
      })

      if (coordinateWithAgent) {
        let agentFound = env.positions[coordinateWithAgent.y][coordinateWithAgent.x].agent
        env.killAgent(agentFound)
      }
    }
  },

  die: {
    order: 7,
    type: 'action',
    label: 'Morrer',
    input: [],
    definition: (env, agent, input) => {
      env.killAgent(agent)
    }
  },

  transform: {
    order: 8,
    type: 'action',
    label: 'Transformar',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Em qual agente?',
        defaultValue: null,
        required: true
      },
      {
        name: 'keep_age',
        type: 'boolean',
        label: 'Manter idade',
        defaultValue: true,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let agentDefinition = _.find(env.definition.agents, { id: input.agent_id })

      agent.definition = agentDefinition
      agent.age = input.keep_age ? agent.age : 0

      env.renderAgent(agent, true)
    }
  },

  set_age: {
    order: 9,
    type: 'action',
    label: 'Definir idade do agente',
    input: [
      {
        name: 'age',
        type: 'number',
        label: 'Idade (em ciclos)',
        defaultValue: 0,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      agent.age = _.isNaN(input.age) ? 0 : input.age
    }
  },

  breed: {
    order: 10,
    type: 'action',
    label: 'Reproduzir agente',
    input: [
      {
        name: 'agent_id',
        type: 'agent',
        label: 'Agente',
        defaultValue: null,
        required: true
      },
      {
        name: 'quantity',
        type: 'number',
        label: 'Quantidade',
        defaultValue: 1,
        required: true
      },
    ],
    definition: (env, agent, input) => {
      let agentDefinition = _.find(env.definition.agents, { id: input.agent_id })
      let quantityCreated = 0

      getAdjacentCoordinates(env, agent.position.x, agent.position.y, env.stageSize, true, (x, y) => {
        if (quantityCreated >= input.quantity) {
          return false
        }

        if (!isCoordinateOccupied(env, x, y)) {
          env.buildAgent(agentDefinition, x, y, 0, true)
          quantityCreated++
        }
      })
    }
  },

  increment_variable: {
    order: 11,
    type: 'action',
    label: 'Incrementar variável',
    input: [
      {
        name: 'variable_id',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let variable = env.variables[input.variable_id]
      ++variable.value
    }
  },

  decrement_variable: {
    order: 12,
    type: 'action',
    label: 'Decrementar variável',
    input: [
      {
        name: 'variable_id',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let variable = env.variables[input.variable_id]
      --variable.value
    }
  },

  set_variable: {
    order: 13,
    type: 'action',
    label: 'Definir valor de variável',
    input: [
      {
        name: 'variable_id',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        required: true
      },
      {
        name: 'value',
        type: 'string',
        label: 'Valor',
        defaultValue: null,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let variable = env.variables[input.variable_id]
      variable.value = variable.definition.data_type === 'number' ? Number(input.value) : input.value
    }
  },

  set_random_value: {
    order: 14,
    type: 'action',
    label: 'Definir valor aleatório para variável',
    input: [
      {
        name: 'variable_id',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        required: true
      },
      {
        name: 'min',
        type: 'number',
        label: 'Valor mínimo',
        defaultValue: 1,
        required: true
      },
      {
        name: 'max',
        type: 'number',
        label: 'Valor máximo',
        defaultValue: 10,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let variable = env.variables[input.variable_id]
      let rand = Math.floor(Math.random() * (input.max - input.min + 1)) + input.min
      variable.value = variable.type === 'string' ? String(rand) : rand
    }
  },

  execute_next_rule: {
    order: 15,
    type: 'action',
    label: 'Executar próxima regra do agente',
    definition: (env, agent, input) => {
      env.executeNextRule()
    }
  }
}
