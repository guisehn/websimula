import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Perceber pista',
  input: [],
  definition: (env, agent, input) => {
    let coordinateWithClue = Util.getAdjacentCoordinates(
      env,
      agent.position.x,
      agent.position.y,
      agent.definition.perception_area,
      false,
      (x, y) => {
        if (Util.coordinateHasClue(env, x, y)) {
          return true
        }
      }
    )

    return Boolean(coordinateWithClue)
  },
  help: () =>
    `<p>Use esta condição para verificar se o agente atual está percebendo alguma pista
     no ambiente. Esta verificação está sujeita à área de percepção
     definida para o agente atual (do qual a regra de comportamento pertence). Por exemplo, se
     a área de percepção do agente for <code>3</code>, ele conseguirá perceber pistas a três
     quadrados de distância, em qualquer direção. Caso seja <code>0</code>, ele não conseguirá
     perceber nenhuma pista.</p>`
}
