import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

import moveRandom from './move_random'
import escapeImage from '../../../images/escape-from-agent.png'

export default {
  label: 'Fugir de agente',
  input: [
    {
      name: 'agent_id',
      type: 'agent',
      label: 'Qual agente?',
      defaultValue: null,
      required: true
    }
  ],
  definition: (env, agent, input) => {
    let coordinatesWithEnemies = Util.getAdjacentCoordinates(
      env,
      agent.position.x,
      agent.position.y,
      agent.definition.perception_area,
      true,
      (x, y) => {
        let position = env.positions[y][x]

        if (position && position.agent && position.agent.definition.id === input.agent_id) {
          return true
        }
      }
    )

    let freeCoordinates = Util.getAdjacentCoordinates(
      env,
      agent.position.x,
      agent.position.y,
      2, // use fixed perception area here
      true,
      (x, y) => {
        let position = env.positions[y][x]
        if (!position) return true
      }
    )

    let coordinatesWithScores = freeCoordinates.map(c => {
      let nextStep = Util.astarFindPathTo(env, agent, c.x, c.y)
      let score = _.sumBy(coordinatesWithEnemies, ce => Util.calculateDistance(c.x, c.y, ce.x, ce.y))

      if (!nextStep) {
        return
      }

      // make sure next step doesn't touch enemy
      // if it does, we decrease the score
      let nextStepTouchesEnemy = Util.getAdjacentCoordinates(env, nextStep.x, nextStep.y, 1, false, (x, y) => {
        if (Util.isDiagonalBlocked(env, x, y, nextStep.x, nextStep.y)) {
          return
        }

        let position = env.positions[y][x]

        if (position && position.agent && position.agent.definition.id === input.agent_id) {
          return true
        }
      })

      if (nextStepTouchesEnemy) {
        score -= 999
      }

      return { x: c.x, y: c.y, nextStep: nextStep, score: score }
    })

    let selectedCoordinate = _.maxBy(coordinatesWithScores, 'score')

    if (selectedCoordinate) {
      env.moveAgent(agent, selectedCoordinate.nextStep.x, selectedCoordinate.nextStep.y)
    } else {
      moveRandom.definition(env, agent, {})
    }
  },
  help: () =>
    `<p>Faz com que o agente fuja de outro agente (mova em movimento contrário a ele), caso esteja
     dentro de sua área de percepção. Caso o agente escolhido não esteja em sua área de percepção,
     ele não irá se mover. Geralmente, utiliza-se esta ação associada à condição "Perceber agente".</p>

     <div class="help-illustration">
      <img src="${escapeImage}" class="pixelated">
     </div>`
}
