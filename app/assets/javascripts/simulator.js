(function (global) {
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
        if (this.definition.stop_condition) {
          if (this._evaluateCondition(this.definition.stop_condition)) {
            this.finished = true
            this.stopLoop()
            this._setButtonsStates()
            return
          }
        }

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
      return {
        id: ++this.agentAutoIncrement,
        definition: definition,
        position: { x: x, y: y },
        age: 0,
        element: null
      }
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

    _incrementCycleCount() {
      this._setCycleCount(this.cycleCount + 1)
    }

    _setCycleCount(value) {
      this.cycleCount = value
      $('[data-bind=cycle-count]').text(this.cycleCount)
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
        $('[data-bind=speed]').text(this.value)

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

      this.stage.on('click', function (e) {
        if (simulator.movingAgent) {
          let offset = $(this).offset()
          let x = Math.floor((e.pageX - offset.left) / AGENT_SIZE)
          let y = Math.floor((e.pageY - offset.top) / AGENT_SIZE)

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

      $(document).off('.close-agent-context-menu').on('click.close-agent-context-menu', () => {
        simulator._removeContextMenu()
      })
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

        this.variables[variable.id] = { definition: variable, value: value }
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

        let agent = this.buildAgent(agentDefinition, pos.x, pos.y)
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

          let agent = this.buildAgent(agentDefinition, pos.x, pos.y)
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
        let returnValue = func.definition(this, agent, node.input)

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
          setTimeout(() => agent.element.remove(), 150)
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
        top: `${AGENT_SIZE * agent.position.y}px`,
        left: `${AGENT_SIZE * agent.position.x}px`
      })
    }

    _render() {
      this.stage.html('')
      this.agents.forEach(agent => this._renderAgent(agent))
    }

    _createContextMenu(agent) {
      if (this.finished) return

      this._stopMovingAgent()
      this._removeContextMenu()

      let template = $('#agent-context-menu-template').html().trim()
      let menu = $(template).data('agent', agent).appendTo(this.stage)

      menu.on('contextmenu', e => e.preventDefault())

      menu.css({
        top: `${AGENT_SIZE * agent.position.y + AGENT_SIZE - 5}px`,
        left: `${AGENT_SIZE * agent.position.x + AGENT_SIZE - 5}px`
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
})(window)
