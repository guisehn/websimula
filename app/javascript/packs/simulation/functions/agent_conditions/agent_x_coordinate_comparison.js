import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Comparar coordenada X (horizontal) do agente',
  input: [
    {
      name: 'comparison',
      type: 'string',
      label: 'Coordenada X do agente',
      defaultValue: '=',
      required: true,
      options: Util.COMPARISON_OPTIONS
    },
    {
      name: 'value',
      type: 'number',
      label: 'Coordenada X',
      hideLabel: true,
      defaultValue: '',
      required: true
    }
  ],
  definition: (env, agent, input) => {
    return Util.performComparison(agent.position.x + 1, input.value, input.comparison)
  },
  help: () =>
    `<p>Use esta condição para verificar a coordenada X (horizontal) do agente atual no ambiente. Exemplos:<p>
     <ul>
       <li>É igual a <code>5</code> -- verifica se o agente está na coluna 5 do ambiente</li>
       <li>É maior que <code>5</code> -- verifica se o agente está à direita da coluna 5 do ambiente</li>
       <li>É igual a <code>[X]</code> (entre colchetes) -- verifica se a coluna do agente é igual ao valor da variável <code>X</code></li>
     </ul>`
}
