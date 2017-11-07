import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Matar agente',
  input: [
    {
      name: 'agent_id',
      type: 'agent',
      label: 'Qual agente?',
      defaultValue: null,
      nullLabel: 'Qualquer agente',
      required: false,
    },
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
    let coordinateWithAgent

    if (input.direction) {
      let coordinate = Util.generateCoordinateFromMovement(env, agent.position.x, agent.position.y,
        input.direction, 1, false)

      if (Util.isCoordinateOccupied(env, coordinate.x, coordinate.y, input.agent_id, true)) {
        coordinateWithAgent = coordinate
      }
    } else {
      coordinateWithAgent = Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y, 1, false, (x, y) => {
        if (Util.isDiagonalBlocked(env, x, y, agent.position.x, agent.position.y)) {
          return
        }

        let position = env.positions[y][x]

        if (position && position.agent && (!input.agent_id || position.agent.definition.id === input.agent_id)) {
          return true
        }
      })
    }

    if (coordinateWithAgent) {
      let agentFound = env.positions[coordinateWithAgent.y][coordinateWithAgent.x].agent
      env.killAgent(agentFound)
    }
  },
  help: () =>
    `<p>Faz com que o agente mate outro agente, específico ou não, removendo-o do ambiente.
     Ele só irá matar o agente caso esteja a um quadrado de distância, em qualquer direção, incluindo
     diagonais, do agente a ser morto. Geralmente, utiliza-se esta ação associada à condição "Atingir agente".</p>`
}
