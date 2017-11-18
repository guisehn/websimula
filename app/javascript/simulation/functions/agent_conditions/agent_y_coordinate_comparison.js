import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Comparar coordenada Y (vertical) do agente',
  input: [
    {
      name: 'comparison',
      type: 'string',
      label: 'Coordenada Y do agente',
      defaultValue: '=',
      required: true,
      options: Constants.COMPARISON_OPTIONS
    },
    {
      name: 'value',
      type: 'number',
      label: 'Coordenada Y',
      hideLabel: true,
      defaultValue: '',
      required: true
    }
  ],
  definition: (env, agent, input) => {
    return Util.performComparison(agent.position.y + 1, input.value, input.comparison)
  },
  help: () =>
    `<p>Use esta condição para verificar a coordenada Y (vertical) do agente atual no ambiente. Exemplos:<p>
     <ul>
       <li>É igual a <code>5</code> -- verifica se o agente está na linha 5 do ambiente</li>
       <li>É maior que <code>5</code> -- verifica se o agente está abaixo da linha 5 do ambiente</li>
       <li>É igual a <code>[X]</code> (entre colchetes) -- verifica se a linha do agente é igual ao valor da variável <code>X</code></li>
     </ul>`
}
