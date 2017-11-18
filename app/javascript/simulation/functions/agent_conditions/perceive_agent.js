import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

import perceiveImage from '../../../images/perceive-agent.png'
import notPerceiveImage from '../../../images/not-perceive-agent.png'

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

        if (position && position.agent && (!input.agent_id || position.agent.definition.id === input.agent_id)) {
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
     perceber nenhum agente.</p>

     <p>A <b>ilustração a</b> exibe um agente (amarelo) com área de percepção igual a 3 percebendo um
     outro agente (vermelho), e a <b>ilustração b</b> exibe este mesmo agente sem conseguir perceber o
     outro agente por este estar fora de sua área de percepção.</p>

     <div class="help-illustration">
       <img src="${perceiveImage}" class="pixelated" width="112" height="128" alt="Agente percebido">
       <span class="illustration-label">a) Agente percebido</span>
     </div>

     <div class="help-illustration">
       <img src="${notPerceiveImage}" class="pixelated" width="112" height="128" alt="Agente fora da área de percepção">
       <span class="illustration-label">b) Agente fora da área de percepção</span>
     </div>`
}
