import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Comparar variável com valor',
  input: [
    {
      name: 'variable_id',
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
    let variable = env.variables[input.variable_id]
    return Util.performComparison(variable.value, input.value, input.comparison)
  },
  help: () =>
    `<p>Use esta condição para comparar o valor de uma variável. Exemplos:</p>
     <ul>
       <li><code>Bandeiras capturadas</code> é maior que <code>5</code></li>
       <li><code>Nome</code> é igual a <code>foo</code></li>
     </ul>`
}
