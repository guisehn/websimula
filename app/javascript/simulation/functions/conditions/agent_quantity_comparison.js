import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Comparar quantidade de agentes',
  input: [
    {
      name: 'agent_id',
      type: 'agent',
      label: 'Quantidade de agentes do tipo',
      defaultValue: null,
      required: true
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
    let count = env.agents.filter(a => a.definition.id === input.agent_id).length
    return Util.performComparison(count, input.value, input.comparison)
  },
  help: () =>
    `<p>Use esta condição para verificar a quantidade de um tipo de agente no ambiente. Exemplos:</p>
     <ul>
       <li><code>Rato</code> é igual a <code>0</code> (quando não houver nenhum agente <code>Rato</code> no ambiente)</li>
       <li><code>Queijo</code> é maior que <code>5</code> (quando houver mais que cinco agentes <code>Queijo</code> no ambiente)</li>
     </ul>
     <p><b>Importante:</b> esta regra não leva em consideração a área de percepção do agente caso esteja sendo usada para uma regra
     de comportamento. Para levar em conta a área de percepção, use a condição "Comparar quantidade de agentes percebidos"</p>`
}
