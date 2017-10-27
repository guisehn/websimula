import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
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
    `<p>Use esta condição para verificar se o agente atual está atingindo algum outro agente,
     específico ou não. Por atingir, entende-se que ele esteja a um quadrado de distância do
     outro agente em qualquer direção, incluindo diagonais.</p>`
}
