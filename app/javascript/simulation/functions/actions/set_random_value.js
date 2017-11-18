import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Definir valor aleatório para variável',
  input: [
    {
      name: 'variable_id',
      type: 'variable',
      label: 'Qual variável?',
      defaultValue: null,
      required: true
    },
    {
      name: 'min',
      type: 'number',
      label: 'Valor mínimo',
      defaultValue: 1,
      required: true
    },
    {
      name: 'max',
      type: 'number',
      label: 'Valor máximo',
      defaultValue: 10,
      required: true
    }
  ],
  definition: (env, agent, input) => {
    let variable = env.variables[input.variable_id]
    let rand = Math.floor(Math.random() * (input.max - input.min + 1)) + input.min
    variable.value = variable.type === 'string' ? String(rand) : rand
  },
  help: () =>
    `<p>Redefine o valor de uma variável para um valor aleatório.</p>`
}
