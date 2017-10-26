const Util = {
  COMPARISON_OPTIONS: [
    { value: '=', label: 'É igual a' },
    { value: '!=', label: 'É diferente de' },
    { value: '>', label: 'É maior que' },
    { value: '>=', label: 'É maior ou igual que' },
    { value: '<', label: 'É menor que' },
    { value: '<=', label: 'É menor ou igual a' }
  ],

  DIRECTION_OPTIONS: [
    { value: 'N', label: 'Norte' },
    { value: 'S', label: 'Sul' },
    { value: 'E', label: 'Leste' },
    { value: 'W', label: 'Oeste' },
    { value: 'NE', label: 'Nordeste' },
    { value: 'NW', label: 'Noroeste' },
    { value: 'SE', label: 'Sudeste' },
    { value: 'SW', label: 'Sudoeste' }
  ],

  performComparison(value1, value2, comparer) {
    switch (comparer) {
      case '=':  return value1 == value2
      case '!=': return value1 != value2
      case '>':  return value1 > value2
      case '>=': return value1 >= value2
      case '<':  return value1 < value2
      case '<=': return value1 <= value2
    }
  },

  getAdjacentCoordinates(env, x, y, radius = 1, findFunctionReturnAll, findFunction) {
    let z = 2 * radius + 1
    let _x = 0, _y = 0, dx = 0, dy = -1
    let coordinates = []

    // generate coordinates in spiral, based on
    // https://stackoverflow.com/questions/398299/looping-in-a-spiral
    for (let i = 0, j = Math.pow(z, 2); i < j; i++) {
      if (i > 0) {
        let px = _x + x
        let py = _y + y

        // is this coordinate in the stage?
        if (Util.isCoordinateInsideStage(env, px, py)) {
          let xy = { x: px, y: py }

          // if we have a findFunction, we check the coordinate against this function
          // and return the coordinate if it returns true
          if (findFunction) {
            let result = findFunction(px, py)

            if (result === false) {
              break
            }

            if (result) {
              if (findFunctionReturnAll) {
                coordinates.push(xy)
              } else {
                return xy
              }
            }
          } else {
            coordinates.push(xy)
          }
        }
      }

      if (_x === _y || (_x < 0 && _x === -_y) || (_x > 0 && _x === 1 - _y)) {
        [dx, dy] = [-dy, dx]
      }

      _x = _x + dx
      _y = _y + dy
    }

    return findFunction && !findFunctionReturnAll ? null : coordinates
  },

  isCoordinateInsideStage(env, x, y) {
    return x >= 0 && y >= 0 && x < env.stageSize && y < env.stageSize
  },

  isCoordinateOccupied(env, x, y) {
    if (_.isObject(x)) [x, y] = [x.x, x.y]

    let line = env.positions[y]
    let coordinate = _.get(line, x)
    return _.get(coordinate, 'type') === 'agent'
  },

  coordinateExists(env, x, y) {
    if (_.isObject(x)) [x, y] = [x.x, x.y]

    let line = env.positions[y]
    return _.has(line, x)
  },

  isDiagonalBlocked(env, x1, y1, x2, y2) {
    if (_.isObject(x1)) [x1, y1] = [x1.x, x1.y]
    if (_.isObject(y1)) [x2, y2] = [y1.x, y1.y]

    return x1 !== x2 && y1 !== y2
      && Util.isCoordinateOccupied(env, x1, y2)
      && Util.isCoordinateOccupied(env, x2, y1)
  },

  generateCoordinateFromMovement(env, x, y, direction, steps = 1, ensureCoordinateIsInsideStage) {
    if (direction.indexOf('W') !== -1) x -= steps
    if (direction.indexOf('E') !== -1) x += steps

    if (direction.indexOf('N') !== -1) y -= steps
    if (direction.indexOf('S') !== -1) y += steps

    return ensureCoordinateIsInsideStage
      ? Util.ensureCoordinateIsInsideStage(env, x, y)
      : { x, y }
  },

  ensureCoordinateIsInsideStage(env, x, y) {
    if (x < 0) {
      x = 0
    } else if (x >= env.stageSize) {
      x = env.stageSize - 1
    }

    if (y < 0) {
      y = 0
    } else if (y >= env.stageSize) {
      y = env.stageSize - 1
    }

    return { x: x, y: y }
  },

  // Simple path finder (gets stuck easily)
  simpleFindPathTo(env, agent, x, y) {
    let closerX = agent.position.x
    let closerY = agent.position.y

    if (x > agent.position.x) {
      ++closerX
    } else if (x < agent.position.x) {
      --closerX
    }

    if (y > agent.position.y) {
      ++closerY
    } else if (y < agent.position.y) {
      --closerY
    }

    let isHorizontalOccupied = Util.isCoordinateOccupied(env, closerX, agent.position.y)
    let isVerticalOccupied = Util.isCoordinateOccupied(env, agent.position.x, closerY)
    let isDiagonalOccupied = Util.isCoordinateOccupied(env, closerX, closerY)

    if (!isDiagonalOccupied && (!isHorizontalOccupied || !isVerticalOccupied)) {
      return { x: closerX, y: closerY }
    }

    if (!isHorizontalOccupied) {
      return { x: closerX, y: agent.position.y }
    }

    if (!isVerticalOccupied) {
      return { x: agent.position.x, y: closerY }
    }

    return null
  },

  // A* path finder
  astarFindPathTo(env, agent, targetX, targetY) {
    let foundNodes = {}
    let closedNodes = []
    let openNodes = [{ x: agent.position.x, y: agent.position.y, isRoot: true }]
    let currentNode = openNodes[0]

    let getAdjacentNodes = (node) => {
      let adjacentCoordinates = Util.getAdjacentCoordinates(env, node.x, node.y, 1, true, (x, y) => {
        if (x === targetX && y === targetY) return true
        if (!Util.isCoordinateOccupied(env, x, y) && !Util.isDiagonalBlocked(env, x, y, node.x, node.y) && !_.get(foundNodes, `${y}.${x}`)) return true
      })

      let adjacentNodes = adjacentCoordinates.map(coordinate => {
        let g = Util.calculateDistance(coordinate.x, coordinate.y, agent.position.x, agent.position.y)
        let h = Util.calculateDistance(coordinate.x, coordinate.y, targetX, targetY)
        let f = g + h

        return {
          x: coordinate.x,
          y: coordinate.y,
          parent: node,
          g, h, f
        }
      })

      return adjacentNodes
    }

    while (currentNode && currentNode.h !== 0 && openNodes.length) {
      // move current node from open -> closed
      _.remove(openNodes, currentNode)
      _.set(foundNodes, `${currentNode.y}.${currentNode.x}`, true)
      if (!currentNode.isRoot) closedNodes.push(currentNode)

      // generate adjacent nodes
      let adjacentNodes = getAdjacentNodes(currentNode)
      openNodes.push.apply(openNodes, adjacentNodes)
      adjacentNodes.forEach(node => _.set(foundNodes, `${node.y}.${node.x}`, true))

      // go to next node
      let next = _.minBy(openNodes, 'f')
      currentNode = next
    }

    // if `currentNode` is defined, it means we found a path to the target coordinate
    // otherwise we get the most approximate solution
    let willArrive = Boolean(currentNode)
    let finalNode = currentNode ? currentNode : _.minBy(closedNodes, 'f')

    if (finalNode) {
      // retrieve the first step taken to arrive at this node
      while (!finalNode.parent.isRoot) {
        finalNode = finalNode.parent
      }

      return { x: finalNode.x, y: finalNode.y, willArrive: willArrive }
    }

    return null
  },

  calculateDistance(x1, y1, x2, y2) {
    let dx = Math.abs(x1 - x2)
    let dy = Math.abs(y1 - y2)
    let max = Math.max(dx, dy)
    let min = Math.min(dx, dy)
    return 14 * min + 10 * (max - min)
  }
}

export default Util
