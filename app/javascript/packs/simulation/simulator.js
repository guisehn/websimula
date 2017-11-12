import _ from 'lodash'
import ExpressionEvaluator from 'expr-eval'

import Constants from '../constants'
import SimulationFunctions from './functions'

import clueImage from '../../images/clue.png'

let global = window

const CONTEXT_MENU_TEMPLATE = `
  <div class="simulator-context-menu">
    <ul class="dropdown-menu options-dropdown">
      <% if (agent) { %>
        <li class="dropdown-header">
          Agente:
          <%- agent.definition.name %>
          (<%- agent.age %> ciclo<% if (agent.age !== 1) { %>s<% } %>)
        </li>
        <li><a href="" data-action="move-agent">Mover agente</a></li>
        <li><a href="" data-action="kill-agent">Remover agente</a></li>

        <% if (!clue) { %>
          <li><a href="" data-action="add-clue">Deixar pista</a></li>
        <% } %>
      <% } %>

      <% if (agent && clue) { %>
        <li role="separator" class="divider"></li>
      <% } %>

      <% if (clue) { %>
        <li class="dropdown-header">
          Pista
          (<%- clue.age %> ciclo<% if (clue.age !== 1) { %>s<% } %>)
        </li>
        <li><a href="" data-action="remove-clue">Remover pista</a></li>
      <% } %>

      <% if (!agent && !clue) { %>
        <li><a href="" data-action="add-clue">Adicionar pista</a></li>
        <li><a href="" data-action="show-agent-dropdown">Adicionar agente</a></li>
      <% } %>
    </ul>

    <ul class="dropdown-menu agents-dropdown" style="display:none">
      <li class="dropdown-header">Adicionar agente em (<%- x + 1 %>, <%- y + 1 %>)</li>
      <% agents.forEach(function(agent) { %>
        <li>
          <a href="" data-action="add-agent" data-agent-id="<%- agent.id %>">
            <img src="<%- agent.image %>" class="pixelated">
            <%- agent.name %>
          </a>
        </li>
      <% }) %>
    </ul>
  </div>`

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
    this.clues = []
    this.positions = []

    // TODO: this is used to store the clues while there's an agent
    // occupying its position, because a position can only store one item currently.
    // Ideally we should be able to store multiple items in a same position
    // e.g. positions[y][x] = [{ type: 'agent', ... }, { type: 'clue', ... }]
    this.tempCluePositions = []

    this._bindEvents()
    this._buildVariablesTable()
    this._buildAgentsTable()
    this._setStageDimensions()
    this._sortAgentRules()
    this._buildExpressionParser()
  }

  reset() {
    this.finished = false
    this.movingAgent = null
    this.autoIncrement = 0

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

      // increase age of clues
      this.clues.forEach(clue => {
        ++clue.age
      })

      // get agents from top to bottom, left to right
      let agents = _.flatten(this.positions)
        .filter(p => p && p.type === 'agent')
        .map(p => p.agent)

      agents.forEach(agent => {
        ++agent.age
        this.executeAgentRules(agent)
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
      this._captureException(e)

      console.error(e)
      alert('Ocorreu um erro na execução da simulação.')
      this.stopLoop()
    }
  }

  executeNextRule() {
    this.shouldExecuteNextRule = true
  }

  startLoop() {
    if (this.finished) return

    this.stopLoop()
    this.loopInterval = setInterval(() => this.step(), this.speed)
    this._setButtonsStates()

    this.stage.addClass('loop-running')
  }

  stopLoop() {
    if (this.loopInterval) {
      clearInterval(this.loopInterval)
      this.loopInterval = null
      this._setButtonsStates()
    }

    this.stage.removeClass('loop-running')
  }

  buildAgent(definition, x, y, age, render) {
    if (this.positions[y][x]) {
      throw new Error(`Error trying to create agent ${definition.name}. ` +
        `Position ${x}:${y} is already occupied`)
    }

    let agent = {
      id: ++this.autoIncrement,
      definition: definition,
      position: { x, y },
      age: age || 0,
      element: null
    }

    this.positions[y][x] = { type: 'agent', agent: agent }
    this.agents.push(agent)

    if (render) {
      this.renderAgent(agent)
    }

    return agent
  }

  buildClue(x, y) {
    let pos = this.positions[y][x]
    let clue = null

    // get existing clue or create a new one
    if (this.tempCluePositions[y][x] || _.get(pos, 'type') === 'clue') {
      clue = this.tempCluePositions[y][x] || pos
    } else {
      clue = {
        id: ++this.autoIncrement,
        age: 0,
        position: { x, y },
        element: null
      }

      this.clues.push(clue)
    }

    // add it to tempCluePositions or move it to `positions`
    if (_.get(pos, 'type') === 'agent') {
      this.tempCluePositions[y][x] = clue
    } else {
      this.positions[y][x] = { type: 'clue', clue: clue }

      if (this.tempCluePositions[y][x]) {
        this.tempCluePositions[y][x] = null
      }
    }

    // render it
    if (!clue.element) {
      clue.element = $(`<img src="${clueImage}" class="clue">`)
        .css({
          top: `${Constants.AGENT_SIZE * clue.position.y}px`,
          left: `${Constants.AGENT_SIZE * clue.position.x}px`,
          width: `${Constants.AGENT_SIZE}px`,
          height: `${Constants.AGENT_SIZE}px`
        })
        .data('clue', clue)
        .appendTo(this.stage)
    }

    return clue
  }

  moveAgent(agent, x, y) {
    this.positions[agent.position.y][agent.position.x] = null

    // if there's a clue in tempCluePositions, move it to the positions object
    if (this.tempCluePositions[agent.position.y][agent.position.x]) {
      this.buildClue(agent.position.x, agent.position.y)
    }

    this.positions[y][x] = { type: 'agent', agent: agent }

    agent.position = { x: x, y: y }
    this.renderAgent(agent)
  }

  killAgent(agent) {
    // mark agent as dead so that their rules won't be executed on this simulation step
    agent.dead = true

    // remove the agent from the stage
    this.positions[agent.position.y][agent.position.x] = null

    // if there's a clue in tempCluePositions, move it to the positions object
    if (this.tempCluePositions[agent.position.y][agent.position.x]) {
      this.buildClue(agent.position.x, agent.position.y)
    }

    // remove it from list of agents
    // it's important to use `a => a === agent` instead of just `agent` on the 2nd argument
    // of _.remove, otherwise lodash will remove all agents with the same properties such as age, etc.
    _.remove(this.agents, a => a === agent)

    this.renderAgent(agent)
  }

  removeClue(clue) {
    if (clue.element) {
      clue.element.css({ transform: 'scale(0)' })

      setTimeout(() => {
        clue.element.remove()
        clue.element = null
      }, 150)
    }

    _.remove(this.clues, c => c === clue)

    let pos = this.positions[clue.position.y][clue.position.x]

    if (_.get(pos, 'clue') === clue) {
      this.positions[clue.position.y][clue.position.x] = null
    } else if (this.tempCluePositions[clue.position.y][clue.position.x]) {
      this.tempCluePositions[clue.position.y][clue.position.x] = null
    }
  }

  executeAgentRules(agent) {
    let fromIndex = 0

    do {
      if (agent.dead) {
        break
      }

      // reset shouldExecuteNextRule to false
      // one of the rules may end up changing this to true
      this.shouldExecuteNextRule = false

      let [ruleIndex, rule] = this._selectRule(agent, fromIndex)

      if (rule) {
        if (global.debug) console.log('Agent', agent, 'selected rule', rule)
        this._performRuleAction(agent, rule)
      } else {
        if (global.debug) console.log('Agent', agent, 'has no selected rule')
      }

      fromIndex = ruleIndex + 1
    } while (this.shouldExecuteNextRule)
  }

  _buildExpressionParser() {
    this.expressionParser = new ExpressionEvaluator.Parser()
  }

  _parseInput(input, func) {
    let parsedInput = null

    if (func.input) {
      let buildParsedInput = () => {
        if (!parsedInput) {
          parsedInput = _.cloneDeep(input)
        }
      }

      func.input.forEach(arg => {
        if (!_.isNil(input[arg.name]) && (arg.type === 'string' || arg.type === 'number')) {
          buildParsedInput()

          parsedInput[arg.name] = String(parsedInput[arg.name])
          parsedInput[arg.name] = this._injectVariables(parsedInput[arg.name])

          // to-do: do expression parsing on initialization instead of every cycle
          parsedInput[arg.name] = parsedInput[arg.name].replace(/([^\\])?[{]{2}(.*)[}]{2}/g,
            (_, before, expr) => (before || '') + this.expressionParser.parse(expr).evaluate())

          if (arg.type === 'number') {
            parsedInput[arg.name] = Number(parsedInput[arg.name])
          }
        }
      })
    }

    return parsedInput ? parsedInput : input
  }

  _injectVariables(str) {
    _.forEach(this.variables, variable => {
      let value

      if (_.isNaN(variable.value)) {
        value = '0'
      } else if (_.isNil(variable.value)) {
        value = ''
      } else {
        value = JSON.stringify(variable.value)
      }

      str = str.replace(variable.replacementRegex, value)
    })

    return str
  }

  _incrementCycleCount() {
    this._setCycleCount(this.cycleCount + 1)
  }

  _setCycleCount(value) {
    this.cycleCount = value
    this.simulatorElement.find('[data-bind=cycle-count]').text(this.cycleCount)
  }

  _setButtonsStates() {
    this.simulatorElement.toggleClass('finished', this.finished)

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

      simulator.stage.toggleClass('no-transition', this.value <= Constants.DISABLE_TRANSITION_THRESHOLD)

      simulator.speed = this.value
      if (simulator.loopInterval) simulator.startLoop()
    })

    this.simulatorElement.find('[data-value=speed]').val(this.speed).trigger('input')

    this.stage.on('contextmenu', e => e.preventDefault())

    this.stage.on('click contextmenu', function (e) {
      let offset = $(this).offset()
      let x = Math.floor((e.pageX - offset.left) / Constants.AGENT_SIZE)
      let y = Math.floor((e.pageY - offset.top) / Constants.AGENT_SIZE)

      if (simulator.movingAgent) {
        if (!simulator.positions[y][x]) {
          simulator.moveAgent(simulator.movingAgent, x, y)
        }

        simulator._stopMovingAgent()
      } else if (!simulator.finished) {
        simulator._createContextMenu(x, y)
      }

      e.stopPropagation()
      e.preventDefault()
    })

    this.stage.on('click', '.agent-moved', function (e) {
      let agent = $(this).data('agent')

      simulator._stopMovingAgent()
      e.preventDefault()
      e.stopPropagation()
    })

    $(document).on('click.close-simulator-context-menu', () => {
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
      let el = this.simulatorElement.find(`[data-bind-variable=${id}]`)

      if (_.isNaN(variable.value)) {
        el.html('<i>Número inválido</i>')
      } else {
        el.text(variable.value)
      }
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

      let escapedName = _.escapeRegExp(variable.name)
      let regex = new RegExp(`\\[${escapedName}\\]`, 'g')

      this.variables[variable.id] = {
        definition: variable,
        replacementRegex: regex,
        value: value
      }
    })

    this._refreshVariablesTable()
  }

  _clearPositions() {
    for (let y = 0; y < this.stageSize; y++) {
      this.positions[y] = []
      this.tempCluePositions[y] = []

      for (let x = 0; x < this.stageSize; x++) {
        this.positions[y][x] = null
        this.tempCluePositions[y][x] = null
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
      if (agentDefinition) {
        positions.forEach(pos => this.buildAgent(agentDefinition, pos.x, pos.y))
      }
    })

    // add random agents
    let freeCoordinates = this.getFreeCoordinates()
    let randomPositions = _.get(this.definition.initial_positions, 'random_positions', [])

    _.forEach(randomPositions, (quantity, agentId) => {
      agentId = parseInt(agentId, 10)

      let agentDefinition = _.find(this.definition.agents, { id: agentId })
      if (agentDefinition) {
        _.times(quantity, () => {
          let index = _.random(0, freeCoordinates.length - 1)
          let pos = freeCoordinates.splice(index, 1)[0]

          if (pos) this.buildAgent(agentDefinition, pos.x, pos.y)
        })
      }
    })

    this._refreshAgentsTable()
  }

  getFreeCoordinates() {
    let freeCoordinates = []

    for (let y = 0; y < this.stageSize; y++) {
      for (let x = 0; x < this.stageSize; x++) {
        if (!this.positions[y][x]) {
          freeCoordinates.push({ x: x, y: y })
        }
      }
    }

    return freeCoordinates
  }

  _sortAgentRules() {
    this.definition.agents.forEach(agent => {
      agent.rules = _.sortBy(agent.rules, ['priority', r => r.name.toLowerCase()])
    })
  }

  _selectRule(agent, fromIndex = 0) {
    let index = _.findIndex(
      agent.definition.rules,
      rule => rule.condition === null || this._evaluateCondition(rule.condition, agent),
      fromIndex
    )

    return [index, agent.definition.rules[index]]
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
      let input = this._parseInput(action.input || {}, func)
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

  renderAgent(agent, reRender) {
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

    if (!agent.element || reRender) {
      if (agent.element) agent.element.remove()

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
    this.agents.forEach(agent => this.renderAgent(agent))
  }

  _createContextMenu(x, y) {
    if (this.finished) return

    this.stopLoop()
    this._stopMovingAgent()
    this._removeContextMenu()

    let simulator = this
    let agent = _.find(this.agents, a => a.position.x === x && a.position.y === y)
    let clue = _.find(this.clues, c => c.position.x === x && c.position.y === y)
    let template = _.template(CONTEXT_MENU_TEMPLATE.trim())

    let html = template({
      agents: this.definition.agents,
      agent, clue, x, y
    })

    let menu = $(html).data('agent', agent).data('clue', clue).appendTo(this.stage)

    menu.on('click', '[data-action=move-agent]', e => {
      this._removeContextMenu()
      this._startMovingAgent(agent)
      e.preventDefault()
    })

    menu.on('click', '[data-action=kill-agent]', e => {
      this._removeContextMenu()

      if (confirm(`Tem certeza que deseja remover o agente ${agent.definition.name}?`)) {
        setTimeout(() => {
          this.killAgent(agent)
          this._refreshAgentsTable()
        }, 500)
      }

      e.preventDefault()
    })

    menu.on('click', '[data-action=show-agent-dropdown]', e => {
      menu.find('.options-dropdown').hide()
      menu.find('.agents-dropdown').show()
      e.preventDefault()
    })

    menu.on('click', '[data-action=add-agent]', function (e) {
      let id = parseInt($(this).data('agent-id'), 10)
      let definition = _.find(simulator.definition.agents, { id: id })

      simulator._removeContextMenu()
      simulator.buildAgent(definition, x, y, 0, true)

      e.preventDefault()
    })

    menu.on('click', '[data-action=add-clue]', e => {
      this._removeContextMenu()
      this.buildClue(x, y)
      e.preventDefault()
    })

    menu.on('click', '[data-action=remove-clue]', e => {
      this._removeContextMenu()
      this.removeClue(clue)
      e.preventDefault()
    })

    menu.on('click contextmenu', e => {
      e.stopPropagation()
      e.preventDefault()
    })

    menu.css({
      top: `${Constants.AGENT_SIZE * y + Constants.AGENT_SIZE + 2}px`,
      left: `${Constants.AGENT_SIZE * x - (Constants.AGENT_SIZE / 2)}px`
    })
  }

  _removeContextMenu() {
    let menu = this.stage.find('.simulator-context-menu')

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

  _captureException(e) {
    if (global.Raven) {
      let projectId = global.location.pathname.match(/^\/projects\/([0-9]+)/)[1]

      global.Raven.captureException(e, {
        extra: {
          userId: global.simulaUserId,
          projectId: projectId
        }
      })
    }
  }
}

$(document).on('turbolinks:load', () => {
  let $simulator = $('#simulator')

  if (!$simulator.length) {
    return
  }

  let simulator = new Simulator(global.projectDefinition, SimulationFunctions, $simulator)
  simulator.reset()
})
