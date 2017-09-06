(function() {
  'use strict'

  const STAGE_SIZE = 25
  const AGENT_SIZE = 16

  class Simulator {
    constructor(definition, functions, simulatorElement) {
      this.definition = definition
      this.simulatorElement = simulatorElement
      this.stage = simulatorElement.find('.simulator-stage')

      this.speed = 10
      this.variables = {}
      this.functions = functions
      this.agents = []
      this.positions = []

      this._bindEvents()
      this._setStageDimensions()
      this._sortAgentRulesByPriority()
    }

    reset() {
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

    _bindEvents() {
      let simulator = this

      $('[data-action=step]').on('click', () => this.step())

      $('[data-action=reset]').on('click', () => this.reset())

      $('[data-value=speed]').on('input', function () {
        simulator.speed = this.value
        $('[data-bind=speed]').text(this.value)
      })

      $('[data-value=speed]').val(this.speed).trigger('input')
    }

    _setStageDimensions() {
      let size = AGENT_SIZE * STAGE_SIZE

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
      for (let y = 0; y < STAGE_SIZE; y++) {
        this.positions[y] = []

        for (let x = 0; x < STAGE_SIZE; x++) {
          this.positions[y][x] = null
        }
      }
    }

    _resetAgents() {
      this.agents = []

      // add fixed position agents
      this.definition.initial_positions.fixed_positions.forEach(pos => {
        let agentDefinition = this.definition.agents.filter(a => a.id === pos.agent_id)[0]

        let agent = this._buildAgent(agentDefinition)
        this.agents.push(agent)

        this.positions[pos.y][pos.x] = { type: 'agent', agent: agent }
      })

      // add random agents
      let freePositions = this._getFreePositions()

      this.definition.initial_positions.random_positions.forEach(item => {
        let agentDefinition = this.definition.agents.filter(a => a.id === item.agent_id)[0]

        for (let i = 0; i < item.quantity; i++) {
          let index = _.random(0, freePositions.length - 1)
          let pos = freePositions.splice(index, 1)[0]

          let agent = this._buildAgent(agentDefinition)
          this.agents.push(agent)

          this.positions[pos.y][pos.x] = { type: 'agent', agent: agent }
        }
      })
    }

    _getFreePositions() {
      let freePositions = []

      for (let y = 0; y < STAGE_SIZE; y++) {
        for (let x = 0; x < STAGE_SIZE; x++) {
          if (!this.positions[y][x]) {
            freePositions.push({ x: x, y: y })
          }
        }
      }

      return freePositions
    }

    _findAgentPosition(agent) {
      for (let y = 0; y < STAGE_SIZE; y++) {
        for (let x = 0; x < STAGE_SIZE; x++) {
          let pos = this.positions[y][x]

          if (pos && pos.agent === agent) {
            return { x: x, y: y }
          }
        }
      }
    }

    _buildAgent(definition) {
      return {
        definition: definition,
        age: 0
      }
    }

    _killAgent(agent) {
      // mark agent as dead so that their rules won't be executed on this simulation step
      agent.dead = true

      // remove the agent from the stage
      let position = this._findAgentPosition(agent)
      this.positions[y][x] = null

      // remove it from list of agents
      // it's important to use `a => a === agent` instead of just `agent` on the 2nd argument
      // of _.remove, otherwise lodash will remove all agents with the same properties such as age, etc.
      _.remove(this.agents, a => a === agent)
    }

    _sortAgentRulesByPriority() {
      this.definition.agents.forEach(agent => {
        agent.rules = _.sortBy(agent.rules, 'priority')
      })
    }

    _selectRule(agent) {
      return _.find(agent.definition.rules, rule => this._evaluateCondition(rule.condition, agent))
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

    _render() {
      this.stage.html('')

      for (let y = 0; y < STAGE_SIZE; y++) {
        for (let x = 0; x < STAGE_SIZE; x++) {
          let item = this.positions[y][x]

          if (item) {
            if (item.type === 'agent') {
              $('<img class="agent pixelated" />')
                .attr('src', item.agent.definition.image)
                .data('agent', item.agent)
                .css({ top: `${AGENT_SIZE * y}px`, left: `${AGENT_SIZE * x}px` })
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
