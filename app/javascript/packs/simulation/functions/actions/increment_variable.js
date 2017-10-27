import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Incrementar variável',
  input: [
    {
      name: 'variable_id',
      type: 'variable',
      label: 'Qual variável?',
      defaultValue: null,
      required: true
    }
  ],
  definition: (env, agent, input) => {
    let variable = env.variables[input.variable_id]
    ++variable.value
  },
  help: () =>
    `<p>Aumenta em 1 o valor de uma variável numérica.</p>`
}
