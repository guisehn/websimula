import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
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
    `<p>Move o agente para uma coordenada específica no ambiente, onde X representa a coluna e
     Y representa a linha. Caso a coordenada já esteja ocupada, o agente não será movido.</p>`
}
