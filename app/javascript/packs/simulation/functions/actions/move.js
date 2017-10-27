import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Mover em direção',
  input: [
    {
      name: 'direction',
      type: 'string',
      label: 'Direção',
      defaultValue: null,
      nullLabel: 'Escolha a direção',
      required: true,
      options: Util.DIRECTION_OPTIONS
    },
    {
      name: 'steps',
      type: 'number',
      label: 'Quantidade de posições',
      required: true,
      defaultValue: 1
    },
    {
      name: 'deviate',
      type: 'boolean',
      label: 'Tentar desvio',
      defaultValue: true
    }
  ],
  definition: (env, agent, input) => {
    let stepsLeft = input.steps

    let calculateSingleAxisDeviation = () => {
      let targetAxis = _.includes(['N', 'S'], input.direction) ? 'x' : 'y'

      return [
        {
          direction: input.direction,
          targetAxis: targetAxis,
          start: agent.position[targetAxis] - 1,
          endCondition: c => c === 0,
          newValue: c => c - 1
        },
        {
          direction: input.direction,
          targetAxis: targetAxis,
          start: agent.position[targetAxis] + 1,
          endCondition: c => c + 1 === Constants.STAGE_SIZE,
          newValue: c => c + 1
        }
      ]
    }

    let calculateDoubleAxisDeviation = () => {
      let newValue = d => {
        if (_.includes(['S', 'E'], d)) {
          return c => c + 1
        } else {
          return c => c - 1
        }
      }

      let endCondition = d => {
        if (_.includes(['S', 'E'], d)) {
          return c => c + 1 === Constants.STAGE_SIZE
        } else {
          return c => c === 0
        }
      }

      return [
        {
          direction: input.direction[0],
          targetAxis: 'x',
          start: agent.position.x + (input.direction[1] === 'E' ? 1 : -1),
          endCondition: endCondition(input.direction[1]),
          newValue: newValue(input.direction[1])
        },
        {
          direction: input.direction[1],
          targetAxis: 'y',
          start: agent.position.y + (input.direction[0] === 'S' ? 1 : -1),
          endCondition: endCondition(input.direction[0]),
          newValue: newValue(input.direction[0])
        }
      ]
    }

    let calculateDeviations = () => {
      return input.direction.length === 2
        ? calculateDoubleAxisDeviation()
        : calculateSingleAxisDeviation()
    }

    let deviate = () => {
      let deviations = calculateDeviations()

      let results = deviations.map(d => {
        let limitCoordinate = null
        let fixedAxis = d.targetAxis === 'x' ? 'y' : 'x'

        for (let c = d.start, steps = 1; !d.endCondition(c); c = d.newValue(c), steps++) {
          let coordinate = {}
          coordinate[fixedAxis] = agent.position[fixedAxis]
          coordinate[d.targetAxis] = c

          // break on barrier
          if (Util.isCoordinateOccupied(env, coordinate)) {
            break
          }

          if (steps >= stepsLeft && !limitCoordinate) {
            limitCoordinate = _.clone(coordinate)
          }

          coordinate[fixedAxis] += _.includes(['S', 'E'], d.direction) ? 1 : -1

          if (!Util.isCoordinateOccupied(env, coordinate)) {
            return {
              coordinate: limitCoordinate || coordinate,
              stepsTaken: limitCoordinate ? stepsLeft : steps,
              stepsToPath: steps
            }
          }
        }

        return null
      })

      return _.minBy(results.filter(r => r), 'stepsToPath')
    }

    while (stepsLeft > 0) {
      let coordinate = Util.generateCoordinateFromMovement(env, agent.position.x, agent.position.y, input.direction, 1)

      if (!Util.coordinateExists(env, coordinate)) {
        break
      }

      let occupied = Util.isCoordinateOccupied(env, coordinate.x, coordinate.y)
      let diagonalBlocked = Util.isDiagonalBlocked(env, agent.position.x, agent.position.y, coordinate.x, coordinate.y)
      let blocked = occupied || diagonalBlocked

      if (blocked) {
        if (input.deviate) {
          let result = deviate()

          if (result) {
            stepsLeft -= result.stepsTaken
            env.moveAgent(agent, result.coordinate.x, result.coordinate.y)
          } else {
            break
          }
        } else {
          break
        }
      } else {
        env.moveAgent(agent, coordinate.x, coordinate.y)
        stepsLeft--
      }
    }
  }
}
