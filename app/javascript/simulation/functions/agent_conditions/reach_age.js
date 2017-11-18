import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Atingir tempo de vida',
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
    return agent.age >= input.age
  },
  help: () =>
    `<p>Use esta condição para verificar se o agente atual possui idade (em ciclos de simulação)
     igual ou maior a algum valor. Exemplo: se definido como <code>5</code>, será verificado se o
     agente está há cinco ou mais ciclos de simulação presente no ambiente.</p>
     <p>Caso o valor a ser verificado esteja em uma variável, especifique seu nome entre colchetes
     (exemplo: <code>[X]</code>). Nesse exemplo, caso o valor da variável <code>[X]</code> seja 3,
     será verificado se o agente está há três ou mais ciclos de simulação presente no ambiente.</p>`
}
