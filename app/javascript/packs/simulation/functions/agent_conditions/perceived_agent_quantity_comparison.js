import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

import perceivedQuantityCount from '../../../../images/perceive-agent-quantity-count.png'

export default {
  label: 'Comparar quantidade de agentes percebidos',
  input: [
    {
      name: 'agent_id',
      type: 'agent',
      label: 'Qual agente?',
      defaultValue: null,
      nullLabel: 'Qualquer agente',
      required: false
    },
    {
      name: 'comparison',
      type: 'string',
      label: 'Comparação',
      hideLabel: true,
      defaultValue: '=',
      required: true,
      options: Constants.COMPARISON_OPTIONS
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
    let coordinatesWithPerceivedAgents = Util.getAdjacentCoordinates(
      env,
      agent.position.x,
      agent.position.y,
      agent.definition.perception_area,
      true,
      (x, y) => {
        let position = env.positions[y][x]

        if (position && (!input.agent_id || position.agent.definition.id === input.agent_id)) {
          return true
        }
      }
    )

    return Util.performComparison(coordinatesWithPerceivedAgents.length, input.value, input.comparison)
  },
  help: () =>
    `<p>Use esta condição para verificar a quantidade de um tipo de agente no ambiente na área de percepção do agente atual.</p>

     <p>A <b>ilustração a</b> exibe o <b>Agente A</b> (amarelo), com área de percepção igual a 3, percebendo 4 agentes do tipo <b>Agente B</b>.
     O agente ao topo da imagem está fora de sua área de percepção, portanto não é contado.</p>

     <div class="help-illustration">
       <img src="${perceivedQuantityCount}" class="pixelated">
       <span class="illustration-label">a) Agente percebendo outros quatro agentes</span>
     </div>

     <p>Para este exemplo, podemos ter resultados como:</p>

     <ul>
       <li><code>Agente B</code> é menor ou igual a <code>2</code> – falha no teste</li>
       <li><code>Agente B</code> é maior que <code>3</code> – passa no teste</li>
       <li><code>Agente B</code> é igual a <code>4</code> – passa no teste</li>
     </ul>

     <p>Se você quiser contar a quantidade de agentes no ambiente sem levar em conta a área de percepção do agente, use a condição
      "Comparar quantidade de agentes próximos"</p>`
}
