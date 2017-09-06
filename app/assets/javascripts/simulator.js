(function() {
  'use strict'

  const STAGE_SIZE = 25
  const AGENT_SIZE = 16
  const DEFAULT_SPEED = 50

  class Simulator {
    constructor(definition, functions, simulatorElement) {
      this.definition = definition
      this.simulatorElement = simulatorElement
      this.stage = simulatorElement.find('.simulator-stage')

      this.stageSize = STAGE_SIZE
      this.speed = DEFAULT_SPEED

      this.variables = {}
      this.functions = functions
      this.agents = []
      this.positions = []

      this._bindEvents()
      this._setStageDimensions()
      this._sortAgentRulesByPriority()
    }

    reset() {
      this.stopLoop()

      this._resetVariables()
      this._clearPositions()
      this._resetAgents()
      this._render()
    }

    step() {
      // get agents from top to bottom, left to right
      let agents = _.flatten(this.positions)
        .filter(p => p && p.type === 'agent')
        .map(p => p.agent)

      agents.forEach(agent => {
        if (agent.dead) return

        ++agent.age

        let rule = this._selectRule(agent)
        if (rule) this._performRuleAction(agent, rule)
      })
    }

    startLoop() {
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

    _setButtonsStates() {
      if (this.loopInterval) {
        $('[data-action=step], [data-action=start]').attr('disabled', 'disabled')
        $('[data-action=stop]').removeAttr('disabled')
      } else {
        $('[data-action=step], [data-action=start]').removeAttr('disabled')
        $('[data-action=stop]').attr('disabled', 'disabled')
      }
    }

    _bindEvents() {
      let simulator = this

      $('[data-action=step]').on('click', () => this.step())
      $('[data-action=reset]').on('click', () => this.reset())
      $('[data-action=start]').on('click', () => this.startLoop())
      $('[data-action=stop]').on('click', () => this.stopLoop())

      $('[data-value=speed]').on('input', function (e) {
        $('[data-bind=speed]').text(this.value)

        simulator.speed = this.value
        if (simulator.loopInterval) simulator.startLoop()
      })

      $('[data-value=speed]').val(this.speed).trigger('input')
    }

    _setStageDimensions() {
      let size = AGENT_SIZE * this.stageSize

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

        this.variables[variable.id] = value
      })
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

      fixedPositions.forEach(pos => {
        let agentDefinition = this.definition.agents.filter(a => a.id === pos.agent_id)[0]

        let agent = this._buildAgent(agentDefinition, pos.x, pos.y)
        this.agents.push(agent)

        this.positions[pos.y][pos.x] = { type: 'agent', agent: agent }
      })

      // add random agents
      let freePositions = this._getFreePositions()
      let randomPositions = _.get(this.definition.initial_positions, 'random_positions', [])

      randomPositions.forEach(item => {
        let agentDefinition = this.definition.agents.filter(a => a.id === item.agent_id)[0]

        for (let i = 0; i < item.quantity; i++) {
          let index = _.random(0, freePositions.length - 1)
          let pos = freePositions.splice(index, 1)[0]

          let agent = this._buildAgent(agentDefinition, pos.x, pos.y)
          this.agents.push(agent)

          this.positions[pos.y][pos.x] = { type: 'agent', agent: agent }
        }
      })
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

    _buildAgent(definition, x, y) {
      return {
        definition: definition,
        age: 0,
        position: { x: x, y: y }
      }
    }

    _killAgent(agent) {
      // mark agent as dead so that their rules won't be executed on this simulation step
      agent.dead = true

      // remove the agent from the stage
      this.positions[agent.position.y][agent.position.x] = null

      // remove it from list of agents
      // it's important to use `a => a === agent` instead of just `agent` on the 2nd argument
      // of _.remove, otherwise lodash will remove all agents with the same properties such as age, etc.
      _.remove(this.agents, a => a === agent)
    }

    _moveAgent(agent, x, y) {
      this.positions[y][x] = { type: 'agent', agent: agent }
      this.positions[agent.position.y][agent.position.x] = null

      agent.position = { x: x, y: y }
      agent.element.css(this._generateAgentCssPosition(agent))
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
        return func.definition(this, agent, action.input)
      })
    }

    _evaluateCondition(node, agent) {
      if (node.type === 'function_call') {
        let func = this._getFunction(node.function)
        let returnValue = func.definition(this, agent, node.input)

        return node.negate ? !returnValue : returnValue
      }

      // based on
      // https://stackoverflow.com/questions/41831983/how-to-evaluate-expression-tree-with-logical-operators-in-c-sharp
      if (node.type === 'logical_operator') {
        if (node.operator === 'and') {
          // for AND, we can shortcut the evaluation if any child returns false
          for (let i = 0, j = node.children.length; i < j; i++) {
            if (!evaluate(node.children[i], agent)) return false
          }

          // all children returned true, so it's true
          return true
        }

        if (node.operator === 'or') {
          // for OR, we can shortcut the evaluation if any child returns true
          for (let i = 0, j = node.children.length; i < j; i++) {
            if (evaluate(node.children[i], agent)) return true
          }

          // none were true, so must be false
          return false
        }

        throw new Error(`Unexpected node operator ${node.operator}`)
      }

      throw new Error(`Unexpected node type ${node.type}`)
    }

    _generateAgentCssPosition(agent) {
      return {
        top: `${AGENT_SIZE * agent.position.y}px`,
        left: `${AGENT_SIZE * agent.position.x}px`
      }
    }

    _render() {
      this.stage.html('')

      for (let y = 0; y < this.stageSize; y++) {
        for (let x = 0; x < this.stageSize; x++) {
          let item = this.positions[y][x]

          if (item) {
            if (item.type === 'agent') {
              item.agent.element = $('<img class="agent pixelated" />')
                .attr('src', item.agent.definition.image)
                .data('agent', item.agent)
                .css(this._generateAgentCssPosition(item.agent))
                .appendTo(this.stage)
            }
          }
        }
      }
    }
  }

  $(document).on('turbolinks:load', () => {
    let $simulator = $('#simulator')

    if (!$simulator.length) {
      return
    }

    let simulator = new Simulator(window.projectDefinition, window.simulationFunctions, $simulator)
    simulator.reset()
  })
})()
