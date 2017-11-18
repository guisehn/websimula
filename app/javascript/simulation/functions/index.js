import functionList from './list'

let order = 0
let simulationFunctions = {}

_.forEach(functionList, (functions, functionType) => {
  _.forEach(functions, functionName => {
    const func = require(`./${functionType}s/${functionName}`).default

    func.name = functionName
    func.order = ++order
    func.type = functionType

    simulationFunctions[functionName] = func
  })
})

export default simulationFunctions
