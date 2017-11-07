import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

function findInDirection(env, agent, input) {
  let coordinate = Util.generateCoordinateFromMovement(env, agent.position.x, agent.position.y, input.direction)
  return Util.coordinateHasClue(env, coordinate)
}

function findInAllDirections(env, agent, input) {
  let coordinateWithAgent = Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, false, (x, y) => {
    if (Util.isDiagonalBlocked(env, x, y, agent.position.x, agent.position.y)) {
      return
    }

    if (Util.coordinateHasClue(env, x, y)) {
      return true
    }
  })

  return Boolean(coordinateWithAgent)
}

export default {
  label: 'Atingir pista',

  input: [
    {
      name: 'direction',
      type: 'string',
      label: 'Direção',
      defaultValue: null,
      nullLabel: 'Qualquer direção',
      options: Constants.DIRECTION_OPTIONS,
      required: false
    }
  ],

  definition: (env, agent, input) => {
    if (input.direction) {
      return findInDirection(env, agent, input)
    } else {
      return findInAllDirections(env, agent, input)
    }
  },

  help: () =>
    `<p>Use esta condição para verificar se o agente atual está atingindo alguma pista.
     Por atingir, entende-se que ele esteja a um quadrado de distância do
     outro agente em qualquer direção, incluindo diagonais.</p>`
}
