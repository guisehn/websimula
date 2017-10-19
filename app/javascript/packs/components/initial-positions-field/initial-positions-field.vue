<template>
  <div>
    <div class="fixed-positions">
      <h5>Posições fixas</h5>

      <p class="help-text" v-if="!readOnly" :style="{ width: `${stageElementSize}px` }">
        Clique em um quadrado do cenário para adicionar um agente com posição fixa,
        ou clique em um agente existente no cenário para o mover ou excluir.
      </p>

      <div class="simulator-stage-container" oncontextmenu="return false">
        <div class="simulator-stage"
          :style="{ width: `${stageElementSize}px`, height: `${stageElementSize}px` }"
          :class="{ 'edit-mode': !readOnly, 'moving-agent': movingAgent }">
          <!-- show coordinate squares -->
          <span v-for="y in stageSize">
            <a
              href=""
              class="coordinate"
              v-for="x in stageSize"
              v-on:click.prevent.stop="selectCoordinate({ x: x-1, y: y-1 })"
              :style="calculatePosition({ x: x-1, y: y-1 }, true)">
              <span class="sr-only">Coordenada {{ x }},{{ y }}</span>
            </a>
          </span>

          <!-- show highlighted coordinate when user clicks on it to add agent -->
          <span
            class="selected coordinate"
            v-if="addingAgent"
            :style="calculatePosition(addingAgent, true)"
            ></span>

          <!-- show agents -->
          <span v-for="agent in agents" v-if="initialPositions.fixed_positions[agent.id]">
            <img
              class="agent pixelated"
              :src="agent.image"
              :key="coordinate.id"
              :style="calculatePosition(coordinate)"
              :class="agentClass(agent, coordinate)"
              v-on:click.stop="selectAgent(agent, coordinate)"
              v-for="coordinate in initialPositions.fixed_positions[agent.id]" />
          </span>

          <!-- show empty message -->
          <div class="empty" v-if="readOnly">
            <span class="text" v-if="!hasFixedPositions">Nenhum agente fixo</span>
          </div>

          <!-- add agent dropdown -->
          <div v-if="addingAgent"
            v-on:click.stop
            :style="calculatePosition({ x: addingAgent.x, y: addingAgent.y, addX: -8, addY: 18 })"
            class="agent-context-menu">
            <ul class="dropdown-menu">
              <li class="dropdown-header">Adicionar agente fixo</li>
              <li v-for="agent in orderedAgents">
                <a href="" v-on:click.prevent="addAgent(agent)">
                  <img :src="agent.image">
                  {{ agent.name }}
                </a>
              </li>
            </ul>
          </div>

          <!-- selected agent dropdown -->
          <div v-if="selectedAgent"
            v-on:click.stop
            :style="calculatePosition({ x: selectedAgent.coordinate.x, y: selectedAgent.coordinate.y, addX: -8, addY: 18 })"
            class="agent-context-menu">
            <ul class="dropdown-menu">
              <li><a href="" v-on:click.prevent="moveAgent()">Mover agente</a></li>
              <li><a href="" v-on:click.prevent="removeAgent()">Remover agente</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="clearfix"></div>
    </div>

    <div class="random-positions">
      <h5>Agentes com posição aleatória</h5>

      <div class="agents">
        <p class="help-text" v-if="!readOnly">
          Especifique abaixo, para cada agente, a quantidade espalhada
          aleatoriamente no ambiente.
        </p>

        <table class="table">
          <tbody>
            <tr v-for="agent in agents">
              <td nowrap><img :src="agent.image" ></td>
              <td width="100%">{{ agent.name }}</td>
              <td class="times" nowrap>×</td>
              <td nowrap>
                <span v-if="readOnly">{{ initialPositions.random_positions[agent.id] }}</span>
                <input v-if="!readOnly" type="number" min="0" class="form-control" v-model="initialPositions.random_positions[agent.id]">
              </td>
            </tr>
          </tbody>
        </table>
        </ul>
      </div>
    </div>

    <div class="clearfix"></div>
  </div>
</template>

<script>
import Vue from 'vue/dist/vue.esm'
import Constants from '../../constants'
import _ from 'lodash'
import uuid from 'uuid/v4'

export default {
  name: 'initial-positions-field',
  props: ['value', 'agents', 'read-only'],

  data () {
    return {
      initialPositions: this.adjustValue(this.value),
      addingAgent: null,
      selectedAgent: null,
      movingAgent: null
    }
  },

  computed: {
    orderedAgents () {
      return _.orderBy(this.agents, 'name')
    },

    stageElementSize () {
      return Constants.STAGE_SIZE * Constants.AGENT_SIZE
    },

    stageSize () {
      return Constants.STAGE_SIZE
    },

    agentSize () {
      return Constants.AGENT_SIZE
    },

    hasFixedPositions () {
      return _.some(this.initialPositions.fixed_positions, p => p.length > 0)
    }
  },

  methods: {
    calculatePosition (coordinate, addSize) {
      let x = Constants.AGENT_SIZE * coordinate.x + (coordinate.addX || 0)
      let y = Constants.AGENT_SIZE * coordinate.y + (coordinate.addY || 0)

      let obj = { top: `${y}px`, left: `${x}px` }

      if (addSize) {
        obj.width = `${this.agentSize}px`
        obj.height = `${this.agentSize}px`
      }

      return obj
    },

    adjustValue (obj) {
      let initialPositions = obj ? _.cloneDeep(obj) : {}

      if (!initialPositions.fixed_positions) {
        initialPositions.fixed_positions = {}
      }

      if (!initialPositions.random_positions) {
        initialPositions.random_positions = {}
      }

      this.agents.forEach(agent => {
        if (!initialPositions.fixed_positions[agent.id]) {
          initialPositions.fixed_positions[agent.id] = []
        }

        if (!initialPositions.random_positions[agent.id]) {
          initialPositions.random_positions[agent.id] = 0
        }

        initialPositions.fixed_positions[agent.id].forEach(pos => { pos.id = uuid() })
      })

      return initialPositions
    },

    selectCoordinate (coordinate) {
      if (this.readOnly) return

      if (this.movingAgent) {
        this.clearCoordinate(this.movingAgent.coordinate)

        let position = { ...coordinate, id: this.movingAgent.coordinate.id }
        this.initialPositions.fixed_positions[this.movingAgent.agent.id].push(position)

        this.movingAgent = null
      } else {
        this.addingAgent = coordinate
        this.selectedAgent = null
      }
    },

    addAgent (agent) {
      this.initialPositions.fixed_positions[agent.id].push({
        id: uuid(),
        x: this.addingAgent.x,
        y: this.addingAgent.y
      })

      this.addingAgent = null
    },

    selectAgent (agent, coordinate) {
      if (this.readOnly) return

      if (this.movingAgent && this.isSameCoordinate(this.movingAgent.coordinate, coordinate)) {
        this.movingAgent = null
        return
      }

      this.selectedAgent = { agent: agent, coordinate: coordinate }
      this.addingAgent = null
    },

    moveAgent () {
      this.movingAgent = this.selectedAgent
      this.selectedAgent = null
    },

    removeAgent () {
      this.clearCoordinate(this.selectedAgent.coordinate)
      this.selectedAgent = null
    },

    clearCoordinate (coordinate) {
      _.forEach(this.initialPositions.fixed_positions, pos => {
        _.forEach(pos, (c, i) => {
          if (this.isSameCoordinate(coordinate, c)) {
            pos.splice(i, 1)
            return false
          }
        })
      })
    },

    isSameCoordinate(c1, c2) {
      return c1.x === c2.x && c1.y === c2.y
    },

    cancelEdits () {
      this.addingAgent = null
      this.selectedAgent = null
      this.movingAgent = null
    },

    agentClass (agent, coordinate) {
      return {
        'agent-moved': this.movingAgent && this.isSameCoordinate(this.movingAgent.coordinate, coordinate)
      }
    },

    getData () {
      let positions = _.cloneDeep(this.initialPositions)

      _.forEach(positions.fixed_positions, positions => {
        positions.forEach(pos => { delete pos.id })
      })

      _.forEach(positions.random_positions, (val, key) => {
        positions.random_positions[key] = parseInt(val, 10)
      })

      return positions
    }
  },

  mounted () {
    this._cancelListener = e => {
      if (e.type === 'keyup' && e.key.toLowerCase() !== 'escape') {
        return
      }

      Vue.nextTick(() => this.cancelEdits())
    }

    document.body.addEventListener('click', this._cancelListener)
    document.body.addEventListener('keyup', this._cancelListener)
  },

  destroyed () {
    document.body.removeEventListener('click', this._cancelListener)
    document.body.removeEventListener('keyup', this._cancelListener)
  }
}
</script>

<style lang="scss" scoped>
.fixed-positions,
.random-positions {
  float: left;
}

h5 {
  margin-bottom: 16px;
}

tr:last-child td {
  border-bottom: 1px solid #ddd;
}

tr td:first-child {
  border-left: 1px solid #ddd;
}

tr td:last-child {
  border-right: 1px solid #ddd;
}

.random-positions {
  width: 230px;
}

.form-control {
  width: 50px;
  height: 24px;
  font-size: 12px;
  padding: 2px 4px;
}

.times {
  padding-left: 0;
  padding-right: 0;
}

.help-text {
  font-size: 13px;
}
</style>
