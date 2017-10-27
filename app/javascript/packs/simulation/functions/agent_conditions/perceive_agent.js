import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
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
    `<p>Use esta condição para verificar se o agente atual está percebendo algum outro agente
     no ambiente, de tipo específico ou não. Esta verificação está sujeita à área de percepção
     definida para o agente atual (do qual a regra de comportamento pertence). Por exemplo, se
     a área de percepção do agente for <code>3</code>, ele conseguirá perceber agentes a três
     quadrados de distância, em qualquer direção. Caso seja <code>0</code>, ele não conseguirá
     perceber nenhum agente.</p>`
}
