import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Seguir pista',
  input: [
    {
      name: 'mode',
      type: 'string',
      label: 'Modo',
      defaultValue: 'A*',
      options: [
        { value: 'A*', label: 'Inteligente (A*)' },
        { value: 'simple', label: 'Simples' },
      ],
      required: true
    }
  ],
  definition: (env, agent, input) => {
    let moveTo = null

    let coordinateWithClue = Util.getAdjacentCoordinates(
      env,
      agent.position.x,
      agent.position.y,
      agent.definition.perception_area,
      false,
      (x, y) => {
        if (Util.coordinateHasClue(env, x, y)) {
          let findPathTo = input.mode === 'simple' ? Util.simpleFindPathTo : Util.astarFindPathTo
          moveTo = findPathTo(env, agent, x, y)
          if (moveTo) return true
        }
      }
    )

    if (coordinateWithClue
      && !Util.isCoordinateOccupied(env, moveTo.x, moveTo.y)
      && !Util.isDiagonalBlocked(env, agent.position.x, agent.position.y, moveTo.x, moveTo.y)) {
      env.moveAgent(agent, moveTo.x, moveTo.y)
    }
  },
  help: () =>
    `<p>Faz com que o agente siga uma pista (mova em sua direção), caso esteja dentro de sua área
     de percepção. Caso não exista pista em sua área de percepção, ele não irá se mover.
     Geralmente, utiliza-se esta ação associada à condição "Perceber pista".</p>

     <p>Para o campo "Modo", podem ser escolhidas as opções "Inteligente (A*)" ou "Simples".
     No modo inteligente, o agente sempre conseguirá encontrar um caminho para chegar o mais
     próximo possível da pista, desviando de outros agentes se necessário. Este modo
     utiliza o algoritmo de busca de caminho A*.</p>

     <p>No modo simples, o agente tentará se deslocar em direção à pista, mas pode ficar
     preso no caminho caso exista um obstáculo. A única vantagem deste modo é utilizar menor poder
     computacional, deixando a execução da simulação mais rápida caso existam muitos agentes no
     ambiente.</p>`
}
