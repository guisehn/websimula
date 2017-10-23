import _ from 'lodash'

import Constants from '../constants'
import Util from './util'

const SimulationFunctions = {
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
        options: Util.COMPARISON_OPTIONS
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
      return Util.performComparison(variable.value, input.value, input.comparison)
    },
    help: () =>
      `Use esta condição para comparar o valor de uma variável. Exemplos:\n\n` +
      `"Bandeiras capturadas" é maior que 5\n` +
      `"Nome" é igual a "foo"`
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
        options: Util.COMPARISON_OPTIONS
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
      return Util.performComparison(variable1.value, variable2.value, input.comparison)
    },
    help: () =>
      `Use esta condição para comparar o valor de uma variável com outra variável. Exemplo:\n\n` +
      `Variável "Pessoas saudáveis" é maior ou igual à variável "Pessoas doentes"`
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
        options: Util.COMPARISON_OPTIONS
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
      return Util.performComparison(count, input.value, input.comparison)
    },
    help: () =>
      `Use esta condição para verificar a quantidade de um tipo de agente no ambiente. Exemplos:\n\n` +
      `"Rato" é igual a 0 (quando não houver nenhum agente "Rato" no ambiente)\n` +
      `"Queijo" é maior que 5 (quando houver mais que cinco agentes "Queijo" no ambiente)`
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

      if (!Util.isCoordinateOccupied(env, x, y)) {
        return false
      }

      return input.agent_id ? (env.positions[y][x].agent.definition.id == input.agent_id) : true
    },
    help: () =>
      `Use esta condição para verificar se uma coordenada específica do ambiente está ocupada.\n\n` +
      `Você pode, opcionalmente, definir um agente específico a ser verificado. Caso não seja ` +
      `especificado um agente, será verificado se qualquer agente está ocupando aquela posição.\n\n` +
      `Além disso, caso a coordenada a ser verificada estiver em uma variável, você pode usar o ` +
      `nome da variável entre colchetes. Por exemplo, supondo que existam variáveis "Valor A" = 2 e "Valor B" = 3:\n` +
      `X (horizontal) = [Valor A]\n` +
      `Y (vertical) = [Valor B]\n` +
      `Nesse caso, será verificado se a coordenada na coluna 2, linha 3 está ocupada.`
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
        options: Util.COMPARISON_OPTIONS
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
      return Util.performComparison(agent.position.x + 1, input.value, input.comparison)
    },
    help: () =>
      `Use esta condição para verificar a coordenada X (horizontal) do agente atual no ambiente. Exemplo:\n\n` +
      `É igual a 5 -- verifica se o agente está na coluna 5 do ambiente\n` +
      `É maior que 5 -- verifica se o agente está à direita da coluna 5 do ambiente\n` +
      `É igual a [X] (entre colchetes) -- verifica se a coluna do agente é igual ao valor da variável "X"`
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
        options: Util.COMPARISON_OPTIONS
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
      return Util.performComparison(agent.position.y + 1, input.value, input.comparison)
    },
    help: () =>
      `Use esta condição para verificar a coordenada Y (vertical) do agente atual no ambiente. Exemplo:\n\n` +
      `É igual a 5 -- verifica se o agente está na linha 5 do ambiente\n` +
      `É maior que 5 -- verifica se o agente está abaixo da linha 5 do ambiente\n` +
      `É igual a [X] (entre colchetes) -- verifica se a linha do agente é igual ao valor da variável "X"`
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
      let coordinateWithAgent = Util.getAdjacentCoordinates(
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
    },
    help: () =>
      `Use esta condição para verificar se o agente atual está percebendo algum outro agente ` +
      `no ambiente, de tipo específico ou não. Esta verificação está sujeita à área de percepção ` +
      `definida para o agente atual (do qual a regra de comportamento pertence). Por exemplo, se ` +
      `a área de percepção do agente for "3", ele conseguirá perceber agentes a três quadrados de ` +
      `distância, em qualquer direção. Caso seja "0", ele não conseguirá perceber nenhum agente.`
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
      let coordinateWithAgent = Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, false, (x, y) => {
        if (Util.isDiagonalBlocked(env, x, y, agent.position.x, agent.position.y)) {
          return
        }

        let position = env.positions[y][x]

        if (position && (!input.agent_id || position.agent.definition.id === input.agent_id)) {
          return true
        }
      })

      return Boolean(coordinateWithAgent)
    },
    help: () =>
      `Use esta condição para verificar se o agente atual está atingindo algum outro agente, ` +
      `específico ou não. Por atingir, entende-se que ele esteja a um quadrado de distância do ` +
      `outro agente em qualquer direção, incluindo diagonais.`
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
    },
    help: () =>
      `Use esta condição para verificar se o agente atual possui idade (em ciclos de simulação) ` +
      `igual ou maior a algum valor. Exemplo: se definido "5", será verificado se o agente está ` +
      `há cinco ou mais ciclos de simulação presente no ambiente.\n\n` +
      `Caso o valor a ser verificado esteja em uma variável, especifique seu nome entre colchetes ` +
      `(exemplo: [X]). Nesse exemplo, caso o valor da variável [X] seja 3, será verificado se o agente ` +
      `está há três ou mais ciclos de simulação presente no ambiente.`
  },

  move_random: {
    order: 1,
    type: 'action',
    label: 'Mover aleatoriamente',
    input: [
      {
        name: 'allow_diagonal',
        type: 'boolean',
        label: 'Permitir movimento diagonal?',
        defaultValue: true,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let adjacentCoordinates = Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y)
      let freeAdjacentCoordinates = adjacentCoordinates.filter(c => !env.positions[c.y][c.x])

      if (input.allow_diagonal) {
        freeAdjacentCoordinates = freeAdjacentCoordinates.filter(c => !Util.isDiagonalBlocked(env, agent.position.x, agent.position.y, c.x, c.y))
      } else {
        freeAdjacentCoordinates = freeAdjacentCoordinates.filter(c => c.x === agent.position.x || c.y === agent.position.y)
      }

      let randomCoordinate = _.sample(freeAdjacentCoordinates)

      if (randomCoordinate && !Util.isDiagonalBlocked(env, agent.x, agent.y, randomCoordinate.x, randomCoordinate.y)) {
        env.moveAgent(agent, randomCoordinate.x, randomCoordinate.y)
      }
    },
    help: () =>
      `Move o agente para uma posição livre aleatória, caso disponível. Caso o movimento diagonal ` +
      `não seja marcado, o agente irá mover apenas para as posições norte, sul, leste ou oeste.`
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
        options: Util.DIRECTION_OPTIONS
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
        let coordinate = Util.generateCoordinateFromMovement(env, agent.position.x, agent.position.y, input.direction, steps)
        let moved = false

        if (!Util.isCoordinateOccupied(env, coordinate.x, coordinate.y)) {
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
      let coordinate = Util.ensureCoordinateIsInsideStage(env, input.x - 1, input.y - 1)

      if (!Util.isCoordinateOccupied(env, coordinate.x, coordinate.y)) {
        env.moveAgent(agent, coordinate.x, coordinate.y)
      }
    },
    help: () =>
      `Move o agente para uma coordenada específica no ambiente, onde X representa a coluna e` +
      `Y representa a linha. Caso a coordenada já esteja ocupada, o agente não será movido.`
  },

  move_to_random_coordinate: {
    order: 4,
    type: 'action',
    label: 'Mover para coordenada aleatória',
    input: [
      {
        name: 'min_x',
        type: 'number',
        label: 'X mínimo (horizontal)',
        defaultValue: 1,
        required: true
      },
      {
        name: 'max_x',
        type: 'number',
        label: 'X máximo (horizontal)',
        defaultValue: Constants.STAGE_SIZE,
        required: true
      },
      {
        name: 'min_y',
        type: 'number',
        label: 'Y mínimo (vertical)',
        defaultValue: 1,
        required: true
      },
      {
        name: 'max_y',
        type: 'number',
        label: 'Y máximo (vertical)',
        defaultValue: Constants.STAGE_SIZE,
        required: true
      }
    ],
    definition: (env, agent, input) => {
      let freeCordinates = env.getFreeCoordinates()
        .filter(coord => coord.x >= input.min_x - 1)
        .filter(coord => coord.x <= input.max_x - 1)
        .filter(coord => coord.y >= input.min_y - 1)
        .filter(coord => coord.y <= input.max_y - 1)

      let coordinate = _.sample(freeCordinates)

      if (coordinate) {
        env.moveAgent(agent, coordinate.x, coordinate.y)
      }
    },
    help: () =>
      `Move o agente para uma coordenada aleatória livre no ambiente, dentro dos limites (X e Y) ` +
      `especificados. Caso nenhuma coordenada esteja livre dentro destes limites, o agente não é movido.`
  },

  follow_agent: {
    order: 5,
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

      let coordinateWithAgent = Util.getAdjacentCoordinates(
        env,
        agent.position.x,
        agent.position.y,
        agent.definition.perception_area,
        false,
        (x, y) => {
          let position = env.positions[y][x]

          if (position && position.agent.definition.id === input.agent_id) {
            let findPathTo = input.mode === 'simple' ? Util.simpleFindPathTo : Util.astarFindPathTo
            moveTo = findPathTo(env, agent, x, y)
            if (moveTo) return true
          }
        }
      )

      if (coordinateWithAgent
        && !Util.isCoordinateOccupied(env, moveTo.x, moveTo.y)
        && !Util.isDiagonalBlocked(env, agent.position.x, agent.position.y, moveTo.x, moveTo.y)) {
        env.moveAgent(agent, moveTo.x, moveTo.y)
      }
    },
    help: () =>
      `Faz com que o agente siga outro agente (mova em sua direção), caso esteja dentro de sua área ` +
       `de percepção. Caso o agente escolhido não esteja em sua área de percepção, ele não irá se mover. ` +
       `Geralmente, utiliza-se esta ação associada à condição "Perceber agente".\n\n` +
       `Para o campo "Modo", podem ser escolhidas as opções "Inteligente (A*)" ou "Simples".\n\n` +
       `No modo inteligente, o agente sempre conseguirá encontrar um caminho para chegar o mais ` +
       `próximo possível do agente seguido, desviando de outros agentes se necessário. Este modo ` +
       `utiliza o algoritmo de busca de caminho A*.\n\n` +
       `No modo simples, o agente tentará se deslocar em direção ao agente destino, mas pode ficar ` +
       `preso no caminho caso exista um obstáculo. A única vantagem deste modo é utilizar menor poder ` +
       `computacional, deixando a execução da simulação mais rápida caso existam muitos agentes no ` +
       `ambiente.`
  },

  escape_from_agent: {
    order: 6,
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
      let coordinatesWithEnemies = Util.getAdjacentCoordinates(
        env,
        agent.position.x,
        agent.position.y,
        agent.definition.perception_area,
        true,
        (x, y) => {
          let position = env.positions[y][x]

          if (position && position.agent.definition.id === input.agent_id) {
            return true
          }
        }
      )

      let freeCoordinates = Util.getAdjacentCoordinates(
        env,
        agent.position.x,
        agent.position.y,
        2, // use fixed perception area here
        true,
        (x, y) => {
          let position = env.positions[y][x]
          if (!position) return true
        }
      )

      let coordinatesWithScores = freeCoordinates.map(c => {
        let nextStep = Util.astarFindPathTo(env, agent, c.x, c.y)
        let score = _.sumBy(coordinatesWithEnemies, ce => Util.calculateDistance(c.x, c.y, ce.x, ce.y))

        // make sure next step doesn't touch enemy
        // if it does, we decrease the score
        let nextStepTouchesEnemy = Util.getAdjacentCoordinates(env, nextStep.x, nextStep.y, 1, false, (x, y) => {
          if (Util.isDiagonalBlocked(env, x, y, nextStep.x, nextStep.y)) {
            return
          }

          let position = env.positions[y][x]

          if (position && position.agent.definition.id === input.agent_id) {
            return true
          }
        })

        if (nextStepTouchesEnemy) {
          score -= 999
        }

        return { x: c.x, y: c.y, nextStep: nextStep, score: score }
      })

      let selectedCoordinate = _.maxBy(coordinatesWithScores, 'score')

      if (selectedCoordinate) {
        env.moveAgent(agent, selectedCoordinate.nextStep.x, selectedCoordinate.nextStep.y)
      } else {
        SimulationFunctions.move_random.definition(env, agent, {})
      }
    },
    help: () =>
      `Faz com que o agente fuja de outro agente (mova em movimento contrário a ele), caso esteja ` +
      `dentro de sua área de percepção. Caso o agente escolhido não esteja em sua área de percepção, ` +
      `ele não irá se mover. Geralmente, utiliza-se esta ação associada à condição "Perceber agente".`
  },

  kill_agent: {
    order: 7,
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
      let coordinateWithAgent = Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, false, (x, y) => {
        if (Util.isDiagonalBlocked(env, x, y, agent.position.x, agent.position.y)) {
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
    },
    help: () =>
      `Faz com que o agente mate outro agente, específico ou não, removendo-o do ambiente. ` +
      `Ele só irá matar o agente caso esteja a um quadrado de distância, em qualquer direção, incluindo ` +
      `diagonais, do agente a ser morto. Geralmente, utiliza-se esta ação associada à condição "Atingir agente".`
  },

  die: {
    order: 8,
    type: 'action',
    label: 'Morrer',
    input: [],
    definition: (env, agent, input) => {
      env.killAgent(agent)
    },
    help: () =>
      `Faz com que o agente atual seja removido do ambiente.`
  },

  transform: {
    order: 9,
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
    },
    help: () =>
      `Faz com que o agente atual seja transformado em outro tipo de agente. Caso a opção "Manter idade" ` +
      ` não seja marcada, o agente terá a sua idade (em ciclos) redefinida para 0.`
  },

  set_age: {
    order: 10,
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
    },
    help: () =>
      `Define a idade do agente (em ciclos) para um valor específico. Caso o valor que você queira ` +
      `definir esteja em uma variável, utilize o seu nome entre colchetes (por exemplo, [Idade] para ` +
      `uma variável chamada "Idade")`
  },

  breed: {
    order: 11,
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

      Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y, env.stageSize, true, (x, y) => {
        if (quantityCreated >= input.quantity) {
          return false
        }

        if (!Util.isCoordinateOccupied(env, x, y)) {
          env.buildAgent(agentDefinition, x, y, 0, true)
          quantityCreated++
        }
      })
    },
    help: () =>
      `Cria um ou mais novos agentes de determinado tipo no ambiente, de acordo com a quantidade e tipo ` +
      `especificados.Os novos agentes serão criados em volta do agente atual.`
  },

  increment_variable: {
    order: 12,
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
    },
    help: () =>
      `Aumenta em 1 o valor de uma variável numérica.`
  },

  decrement_variable: {
    order: 13,
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
    },
    help: () =>
      `Diminui em 1 o valor de uma variável numérica.`
  },

  set_variable: {
    order: 14,
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
    },
    help: () =>
      `Redefine o valor de uma variável para um determinado valor. Exemplos:\n\n` +
      `Variável: "Valor A" - Valor: 5\n` +
      `Variável: "Palavra" - Valor: foo\n\n` +
      `Também é possível definir valores dinâmicos, baseados em uma ou mais variáveis. Para isso, utilize os ` +
      `símbolos {{ e }} para definir a área de computação, e os nomes de variáveis entre colchetes para ` +
      `acessar seus valores. Exemplos:\n\n` +
      `Variável: "Valor" - Valor: {{ [Valor] + 3 }} -- irá incrementar em 3 o valor da variável "Valor"\n\n` +
      `Variável: "C" - Valor: {{ [A] + [B] }} -- faz com que o valor da variável C seja igual a A + B\n\n` +
      `Variável: "C" - Valor: {{ [B] - [A] }} -- faz com que o valor da variável C seja igual a B - A\n\n` +
      `Variável: "Nome" - Valor: {{ [Nome 1] || "-" || [Nome 2] }} -- faz com que o valor da variável "Nome" seja ` +
      `uma concatenação dos valores das variáveis "Nome 1" e "Nome 2", com um "-" no meio). Nesse caso, ` +
      `se "Nome 1" for João e "Nome 2" for Maria, o valor de "Nome" seria definido para João-Maria.\n\n` +
      `Os operadores matemáticos permitidos são + (soma), - (subtração), * (multiplicação), / (divisão), ` +
      `% (resto) e || (concatenação para textos).`
  },

  set_random_value: {
    order: 15,
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
    },
    help: () =>
      `Redefine o valor de uma variável para um valor aleatório.`
  },

  execute_next_rule: {
    order: 16,
    type: 'action',
    label: 'Executar próxima regra do agente',
    definition: (env, agent, input) => {
      env.executeNextRule()
    },
    help: () =>
      `Tenta executar as próximas regras deste agente (caso as condições passem), em vez de parar ` +
      `de executar as regras.`
  }
}

export default SimulationFunctions
