import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Comparar variável com variável',
  input: [
    {
      name: 'variable1_id',
      type: 'variable',
      label: 'Qual variável?',
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
      options: Util.COMPARISON_OPTIONS
    },
    {
      name: 'variable2_id',
      type: 'variable',
      label: 'Qual variável?',
      defaultValue: null,
      required: true
    }
  ],
  definition: (env, agent, input) => {
    let variable1 = env.variables[input.variable1_id]
    let variable2 = env.variables[input.variable2_id]
    return Util.performComparison(variable1.value, variable2.value, input.comparison)
  },
  help: () =>
    `<p>Use esta condição para comparar o valor de uma variável com outra variável. Exemplo:</p>
     <ul>
       <li>Variável <code>Pessoas saudáveis</code> é maior ou igual à variável <code>Pessoas doentes</code>
     </ul>`
}
