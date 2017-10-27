import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Verificar se coordenada está ocupada',
  input: [
    {
      name: 'x',
      type: 'number',
      label: 'X (horizontal)',
      defaultValue: 1,
      required: true
    },
    {
      name: 'y',
      type: 'number',
      label: 'Y (vertical)',
      defaultValue: 1,
      required: true
    },
    {
      name: 'agent_id',
      type: 'agent',
      label: 'Por qual agente?',
      defaultValue: null,
      nullLabel: 'Qualquer agente',
      required: false
    }
  ],
  definition: (env, agent, input) => {
    let x = input.x - 1
    let y = input.y - 1

    if (!Util.isCoordinateOccupied(env, x, y)) {
      return false
    }

    return input.agent_id ? (env.positions[y][x].agent.definition.id == input.agent_id) : true
  },
  help: () =>
    `<p>Use esta condição para verificar se uma coordenada específica do ambiente está ocupada.</p>
     <p>Você pode, opcionalmente, definir um agente específico a ser verificado. Caso não seja
     especificado um agente, será verificado se qualquer agente está ocupando aquela posição.</p>
     <p>Além disso, caso a coordenada a ser verificada estiver em uma variável, você pode usar o
     nome da variável entre colchetes. Por exemplo, supondo que existam variáveis
     <code>Valor A</code> com valor <code>2</code> e <code>Valor B</code> com valor <code>3</code>,
     e seja definido para esta regra os valores:</p>
     <ul>
       <li><b>X (horizontal):</b> <code>[Valor A]</code></li>
       <li><b>Y (vertical):</b> <code>[Valor B]</code></li>
     </ul>
     <p>Nesse caso, será verificado se a coordenada na coluna 2, linha 3 está ocupada.</p>`
}
