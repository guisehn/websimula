import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
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
    `<p>Move o agente para uma coordenada aleatória livre no ambiente, dentro dos limites (X e Y)
     especificados. Caso nenhuma coordenada esteja livre dentro destes limites, o agente não é movido.</p>`
}
