(function() {
  'use strict'

  const STAGE_SIZE = 25
  const AGENT_SIZE = 16

  class Simulator {
    constructor(definition, simulatorElement) {
      this.definition = definition
      this.simulatorElement = simulatorElement
      this.stage = simulatorElement.find('.simulator-stage')

      this.speed = 10
      this.variables = {}
      this.agents = []
      this.positions = []

      this._bindEvents()
    }

    reset() {
      this._setDimensions()
      this._resetVariables()
      this._clearPositions()
      this._resetAgents()
      this._render()
    }

    step() {

    }

    _bindEvents() {
      let simulator = this

      $('[data-action=reset]').on('click', () => {
        this.reset()
      })

      $('[data-value=speed]').on('input', function () {
        simulator.speed = this.value
        $('[data-bind=speed]').text(this.value)
      })

      $('[data-value=speed]').val(this.speed).trigger('input')
    }

    _setDimensions() {
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

      this.definition.initial_positions.fixed_positions.forEach(pos => {
        let agentDefinition = this.definition.agents.filter(a => a.id === pos.agent_id)[0]

        let agent = this._buildAgent(agentDefinition)

        this.agents.push(agent)
        this.positions[pos.y][pos.x] = { type: 'agent', agent: agent }
      })

      this.definition.initial_positions.random_positions.forEach(item => {
        let agentDefinition = this.definition.agents.filter(a => a.id === item.agent_id)[0]

        for (var i = 0; i < item.quantity; i++) {
          let freePositions = this._getFreePositions()
          let index = this._random(0, freePositions.length - 1)
          let pos = freePositions[index]

          let agent = this._buildAgent(agentDefinition)

          this.agents.push(agent)
          this.positions[pos.y][pos.x] = { type: 'agent', agent: agent }
        }
      })
    }

    _getFreePositions() {
      let freePositions = []

      for (var y = 0; y < STAGE_SIZE; y++) {
        for (var x = 0; x < STAGE_SIZE; x++) {
          if (!this.positions[y][x]) {
            freePositions.push({ x: x, y: y })
          }
        }
      }

      return freePositions
    }

    _buildAgent(definition) {
      return {
        definition: definition,
        age: 0
      }
    }

    _render() {
      this.stage.html('')

      for (var y = 0; y < STAGE_SIZE; y++) {
        for (var x = 0; x < STAGE_SIZE; x++) {
          let item = this.positions[y][x]

          if (item) {
            if (item.type === 'agent') {
              $('<img class="agent" />')
                .attr('src', item.agent.definition.image)
                .data('agent', item.agent)
                .css({ top: `${AGENT_SIZE * y}px`, left: `${AGENT_SIZE * x}px` })
                .appendTo(this.stage)
            }
          }
        }
      }
    }

    _random(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min
    }
  }

  $(document).on('turbolinks:load', () => {
    let $simulator = $('#simulator')

    if (!$simulator.length) {
      return
    }

    let simulator = new Simulator(window.projectDefinition, $simulator)
    simulator.reset()
  })
})()
