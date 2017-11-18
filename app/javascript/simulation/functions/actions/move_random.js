import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
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
    `<p>Move o agente para uma posição livre aleatória, caso disponível. Caso o movimento diagonal
    não seja marcado, o agente irá mover apenas para as posições norte, sul, leste ou oeste.</p>`
}
