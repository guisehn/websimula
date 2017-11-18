import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Remover pista',
  input: [
    {
      name: 'direction',
      type: 'string',
      label: 'Direção',
      defaultValue: null,
      nullLabel: 'Qualquer direção',
      required: false,
      options: Constants.DIRECTION_OPTIONS
    }
  ],
  definition: (env, agent, input) => {
    let coordinate

    if (input.direction) {
      coordinate = Util.generateCoordinateFromMovement(env, agent.position.x, agent.position.y,
        input.direction, 1, false)
    } else if (env.tempCluePositions[agent.position.y][agent.position.x]) {
      coordinate = { x: agent.position.x, y: agent.position.y }
    } else {
      coordinate = Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, false, (x, y) => {
        if (Util.isDiagonalBlocked(env, x, y, agent.position.x, agent.position.y)) {
          return
        }

        if (Util.coordinateHasClue(env, x, y)) {
          return true
        }
      })
    }

    if (coordinate) {
      let clue = Util.getClueAtCoordinate(env, coordinate)
      if (clue) {
        env.removeClue(clue)
      }
    }
  },
  help: () =>
    `<p>Remove uma pista encontrada do ambiente.</p>`
}
