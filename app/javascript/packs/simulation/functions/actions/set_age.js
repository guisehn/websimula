import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Definir idade do agente',
  input: [
    {
      name: 'age',
      type: 'number',
      label: 'Idade (em ciclos)',
      defaultValue: 0,
      required: true
    }
  ],
  definition: (env, agent, input) => {
    agent.age = _.isNaN(input.age) ? 0 : input.age
  },
  help: () =>
    `<p>Define a idade do agente (em ciclos) para um valor específico. Caso o valor que você queira
     definir esteja em uma variável, utilize o seu nome entre colchetes (por exemplo, <code>[Idade]</code>
     para uma variável chamada <code>Idade</code>)</p>`
}
