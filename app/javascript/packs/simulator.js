import _ from 'lodash'
import ExpressionParser from 'expr-eval'
import Constants from './constants'

let global = window

class Simulator {
  constructor(definition, functions, simulatorElement) {
    this.definition = definition
    this.simulatorElement = simulatorElement
    this.stage = simulatorElement.find('.simulator-stage')

    this.stageSize = Constants.STAGE_SIZE
    this.speed = Constants.DEFAULT_SPEED

    this.functions = functions
    this.variables = {}
    this.agents = []
    this.positions = []

    this._bindEvents()
    this._buildVariablesTable()
    this._buildAgentsTable()
    this._setStageDimensions()
    this._sortAgentRulesByPriority()
    this._buildExpressionParser()
  }

  reset() {
    this.finished = false
    this.movingAgent = null
    this.agentAutoIncrement = 0

    this.stopLoop()

    this._setCycleCount(0)
    this._setButtonsStates()
    this._resetVariables()
    this._clearPositions()
    this._resetAgents()
    this._render()
  }

  step() {
    this._removeContextMenu()
    this._stopMovingAgent()

    if (this.finished) return

    try {
      this._incrementCycleCount()

      if (global.debug) console.log('Cycle', this.cycleCount)

      // get agents from top to bottom, left to right
      let agents = _.flatten(this.positions)
        .filter(p => p && p.type === 'agent')
        .map(p => p.agent)

      agents.forEach(agent => {
        if (agent.dead) return

        ++agent.age

        let rule = this._selectRule(agent)

        if (rule) {
          if (global.debug) console.log('Agent', agent, 'selected rule', rule)
          this._performRuleAction(agent, rule)
        } else {
          if (global.debug) console.log('Agent', agent, 'has no selected rule')
        }
      })

      if (this.definition.stop_condition) {
        if (this._evaluateCondition(this.definition.stop_condition)) {
          this.finished = true
          this.stopLoop()
          this._setButtonsStates()
        }
      }

      this._refreshVariablesTable()
      this._refreshAgentsTable()
    } catch (e) {
      console.error(e)
      alert('Ocorreu um erro na execução da simulação.')
      this.stopLoop()
    }
  }

  startLoop() {
    if (this.finished) return

    this.stopLoop()
    this.loopInterval = setInterval(() => this.step(), this.speed)
    this._setButtonsStates()
  }

  stopLoop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval)
      this.loopInterval = null
      this._setButtonsStates()
    }
  }

  buildAgent(definition, x, y) {
    if (this.positions[y][x]) {
      throw new Error(`Error trying to create agent ${definition.name}. ` +
        `Position ${x}:${y} is already occupied`)
    }

    let agent = {
      id: ++this.agentAutoIncrement,
      definition: definition,
      position: { x: x, y: y },
      age: 0,
      element: null
    }

    this.positions[y][x] = { type: 'agent', agent: agent }
    this.agents.push(agent)

    return agent
  }

  moveAgent(agent, x, y) {
    this.positions[y][x] = { type: 'agent', agent: agent }
    this.positions[agent.position.y][agent.position.x] = null

    agent.position = { x: x, y: y }
    this._renderAgent(agent)
  }

  killAgent(agent) {
    // mark agent as dead so that their rules won't be executed on this simulation step
    agent.dead = true

    // remove the agent from the stage
    this.positions[agent.position.y][agent.position.x] = null

    // remove it from list of agents
    // it's important to use `a => a === agent` instead of just `agent` on the 2nd argument
    // of _.remove, otherwise lodash will remove all agents with the same properties such as age, etc.
    _.remove(this.agents, a => a === agent)

    this._renderAgent(agent)
  }

  _buildExpressionParser() {
    this.expressionParser = new ExpressionParser.Parser()
  }

  _parseInput(input, func) {
    let parsedInput = null

    func.input.forEach(arg => {
      if (arg.type === 'string') {
        // only clone the input if we need to (performance)
        if (!parsedInput) parsedInput = _.cloneDeep(input)

        // to-do: do expression parsing on initialization instead of every cycle
        input[arg.name] = input[arg.name].replace(/[^\\]?[{]{2}(.*)[}]{2}/g, (_, before, expr) => {
          return before + this.expressionParser.parse(expr).evaluate()
        })
      }
    })

    return parsedInput ? parsedInput : input
  }

  _incrementCycleCount() {
    this._setCycleCount(this.cycleCount + 1)
  }

  _setCycleCount(value) {
    this.cycleCount = value
    this.simulatorElement.find('[data-bind=cycle-count]').text(this.cycleCount)
  }

  _setButtonsStates() {
    if (this.finished) {
      this.simulatorElement.find('[data-action=step], [data-action=start], [data-action=stop]').attr('disabled', 'disabled')
    } else if (this.loopInterval) {
      this.simulatorElement.find('[data-action=step], [data-action=start]').attr('disabled', 'disabled')
      this.simulatorElement.find('[data-action=stop]').removeAttr('disabled')
    } else {
      this.simulatorElement.find('[data-action=step], [data-action=start]').removeAttr('disabled')
      this.simulatorElement.find('[data-action=stop]').attr('disabled', 'disabled')
    }
  }

  _bindEvents() {
    let simulator = this

    this.simulatorElement.find('[data-action=step]').on('click', () => this.step())
    this.simulatorElement.find('[data-action=reset]').on('click', () => this.reset())
    this.simulatorElement.find('[data-action=start]').on('click', () => this.startLoop())
    this.simulatorElement.find('[data-action=stop]').on('click', () => this.stopLoop())

    this.simulatorElement.find('[data-value=speed]').on('input', function (e) {
      simulator.simulatorElement.find('[data-bind=speed]').text(this.value)

      simulator.speed = this.value
      if (simulator.loopInterval) simulator.startLoop()
    })

    this.simulatorElement.find('[data-value=speed]').val(this.speed).trigger('input')

    this.simulatorElement.on('click', '[data-action=move-agent]', function (e) {
      let agent = $(this).closest('.agent-context-menu').data('agent')
      simulator._startMovingAgent(agent)
      e.preventDefault()
    })

    this.simulatorElement.on('click', '[data-action=kill-agent]', function (e) {
      let agent = $(this).closest('.agent-context-menu').data('agent')

      if (confirm(`Tem certeza que deseja remover o agente ${agent.definition.name}?`)) {
        setTimeout(() => simulator.killAgent(agent), 500)
      }

      e.preventDefault()
    })

    this.stage.on('contextmenu', '.agent', function (e) {
      if (!simulator.finished) {
        simulator._createContextMenu($(this).data('agent'))
      }

      e.stopPropagation()
      e.preventDefault()
    })

    this.stage.on('contextmenu', e => e.preventDefault())

    this.stage.on('click', function (e) {
      if (simulator.movingAgent) {
        let offset = $(this).offset()
        let x = Math.floor((e.pageX - offset.left) / Constants.AGENT_SIZE)
        let y = Math.floor((e.pageY - offset.top) / Constants.AGENT_SIZE)

        if (simulator.positions[y][x]) {
          return false
        }

        simulator.moveAgent(simulator.movingAgent, x, y)
        simulator._stopMovingAgent()
      }
    })

    this.stage.on('click', '.agent-moved', function (e) {
      let agent = $(this).data('agent')

      simulator._stopMovingAgent()
      e.preventDefault()
      e.stopPropagation()
    })

    $(document).on('click.close-agent-context-menu', () => {
      simulator._removeContextMenu()
    })
  }

  _buildAgentsTable() {
    let section = this.simulatorElement.find('.simulator-agents')
    let table = section.find('table')
    let tbody = table.find('tbody').html('')
    let agents = _.sortBy(this.definition.agents, 'name')

    if (agents.length) {
      agents.forEach(agent => {
        let tr = $('<tr></tr>').appendTo(tbody)
        $('<td></td>').text(agent.name).appendTo(tr)
        $('<td></td>').attr('data-bind-agent', agent.id).appendTo(tr)
      })

      this._refreshAgentsTable()
    } else {
      section.hide()
    }
  }

  _refreshAgentsTable() {
    let agentsCount = _(this.agents).groupBy('definition.id').mapValues(a => a.length).value()

    this.definition.agents.forEach(agent => {
      let count = agentsCount[agent.id]
      this.simulatorElement.find(`[data-bind-agent=${agent.id}]`).text(count || 0)
    })
  }

  _buildVariablesTable() {
    let section = this.simulatorElement.find('.simulator-variables')
    let table = section.find('table')
    let tbody = table.find('tbody').html('')
    let variables = _.sortBy(this.definition.variables, 'name')

    if (variables.length) {
      variables.forEach(variable => {
        let tr = $('<tr></tr>').appendTo(tbody)
        $('<td></td>').text(variable.name).appendTo(tr)
        $('<td></td>').attr('data-bind-variable', variable.id).appendTo(tr)
      })

      this._refreshVariablesTable()
    } else {
      section.hide()
    }
  }

  _refreshVariablesTable() {
    _.forEach(this.variables, variable => {
      let id = variable.definition.id
      this.simulatorElement.find(`[data-bind-variable=${id}]`).text(variable.value)
    })
  }

  _setStageDimensions() {
    let size = Constants.AGENT_SIZE * this.stageSize

    this.stage.css({
      width: `${size}px`,
      height: `${size}px`
    })
  }

  _resetVariables() {
    this.variables = {}

    this.definition.variables.forEach(variable => {
      let value

      switch (variable.data_type) {
        case 'number':
          value = Number(variable.initial_value)
          break

        case 'string':
          value = variable.initial_value
          break

        default:
          throw new Error(`Unknown variable type "${variable_data_type}"`)
      }

      this.variables[variable.id] = { definition: variable, value: value }
    })

    this._refreshVariablesTable()
  }

  _clearPositions() {
    for (let y = 0; y < this.stageSize; y++) {
      this.positions[y] = []

      for (let x = 0; x < this.stageSize; x++) {
        this.positions[y][x] = null
      }
    }
  }

  _resetAgents() {
    this.agents = []

    // add fixed position agents
    let fixedPositions = _.get(this.definition.initial_positions, 'fixed_positions', [])

    _.forEach(fixedPositions, (positions, agentId) => {
      agentId = parseInt(agentId, 10)

      let agentDefinition = _.find(this.definition.agents, { id: agentId })
      positions.forEach(pos => this.buildAgent(agentDefinition, pos.x, pos.y))
    })

    // add random agents
    let freePositions = this._getFreePositions()
    let randomPositions = _.get(this.definition.initial_positions, 'random_positions', [])

    _.forEach(randomPositions, (quantity, agentId) => {
      agentId = parseInt(agentId, 10)

      let agentDefinition = _.find(this.definition.agents, { id: agentId })

      _.times(quantity, () => {
        let index = _.random(0, freePositions.length - 1)
        let pos = freePositions.splice(index, 1)[0]

        if (pos) this.buildAgent(agentDefinition, pos.x, pos.y)
      })
    })

    this._refreshAgentsTable()
  }

  _getFreePositions() {
    let freePositions = []

    for (let y = 0; y < this.stageSize; y++) {
      for (let x = 0; x < this.stageSize; x++) {
        if (!this.positions[y][x]) {
          freePositions.push({ x: x, y: y })
        }
      }
    }

    return freePositions
  }

  _sortAgentRulesByPriority() {
    this.definition.agents.forEach(agent => {
      agent.rules = _.sortBy(agent.rules, 'priority')
    })
  }

  _selectRule(agent) {
    return _.find(agent.definition.rules,
      rule => rule.condition === null || this._evaluateCondition(rule.condition, agent))
  }

  _getFunction(functionName) {
    let func = this.functions[functionName]
    if (!func) throw new Error(`Unexpected function ${functionName}`)
    return func
  }

  _performRuleAction(agent, rule) {
    let actions = rule.action
    if (!_.isArray(actions)) actions = [actions]

    return actions.map(action => {
      let func = this._getFunction(action.function)
      let input = action.input || {}
      return func.definition(this, agent, input)
    })
  }

  _evaluateCondition(node, agent) {
    if (node.type === 'function_call') {
      let func = this._getFunction(node.function)
      let input = this._parseInput(node.input, func)
      let returnValue = func.definition(this, agent, input)

      return node.negate ? !returnValue : returnValue
    }

    // based on
    // https://stackoverflow.com/questions/41831983/how-to-evaluate-expression-tree-with-logical-operators-in-c-sharp
    if (node.type === 'logical_operator') {
      if (node.operator === 'and') {
        // for AND, we can shortcut the evaluation if any child returns false
        for (let i = 0, j = node.children.length; i < j; i++) {
          if (!this._evaluateCondition(node.children[i], agent)) return false
        }

        // all children returned true, so it's true
        return true
      }

      if (node.operator === 'or') {
        // for OR, we can shortcut the evaluation if any child returns true
        for (let i = 0, j = node.children.length; i < j; i++) {
          if (this._evaluateCondition(node.children[i], agent)) return true
        }

        // none were true, so must be false
        return false
      }

      throw new Error(`Unexpected node operator ${node.operator}`)
    }

    throw new Error(`Unexpected node type ${node.type}`)
  }

  _renderAgent(agent) {
    if (agent.dead) {
      if (agent.element) {
        agent.element.css({ transform: 'scale(0)' })

        setTimeout(() => {
          agent.element.remove()
          agent.element = null
        }, 150)
      }

      return
    }

    if (!agent.element) {
      agent.element = $('<img class="agent pixelated" />')
        .attr('src', agent.definition.image)
        .data('agent', agent)
        .appendTo(this.stage)
    }

    agent.element.css({
      top: `${Constants.AGENT_SIZE * agent.position.y}px`,
      left: `${Constants.AGENT_SIZE * agent.position.x}px`
    })
  }

  _render() {
    this.stage.html('')
    this.agents.forEach(agent => this._renderAgent(agent))
  }

  _createContextMenu(agent) {
    if (this.finished) return

    this.stopLoop()
    this._stopMovingAgent()
    this._removeContextMenu()

    let template = $('#agent-context-menu-template').html().trim()
    let menu = $(template).data('agent', agent).appendTo(this.stage)

    menu.on('contextmenu', e => e.preventDefault())

    menu.css({
      top: `${Constants.AGENT_SIZE * agent.position.y + Constants.AGENT_SIZE + 2}px`,
      left: `${Constants.AGENT_SIZE * agent.position.x - (Constants.AGENT_SIZE / 2)}px`
    })
  }

  _removeContextMenu() {
    let menu = this.stage.find('.agent-context-menu')

    if (menu.length) {
      menu.css('opacity', 0)
      setTimeout(() => menu.remove(), 150)
    }
  }

  _startMovingAgent(agent) {
    if (this.finished) return

    this.movingAgent = agent
    agent.element.addClass('agent-moved')
    this.stage.addClass('moving-agent')
  }

  _stopMovingAgent() {
    if (this.movingAgent) {
      this.movingAgent.element.removeClass('agent-moved')
    }

    this.movingAgent = false
    this.stage.removeClass('moving-agent')
  }
}

$(document).on('turbolinks:load', () => {
  let $simulator = $('#simulator')

  if (!$simulator.length) {
    return
  }

  let simulator = new Simulator(global.projectDefinition, global.simulationFunctions, $simulator)
  simulator.reset()
})
