<template>
  <span>
    <select class="form-control" v-model="item.function" v-on:change="changeFunction" :disabled="readOnly">
      <option v-if="!item.function" :value="null">{{ emptyLabel }}</option>
      <option v-for="func in availableFunctions" :value="func.key">{{ func.data.label }}</option>
    </select>

    <span v-for="input in selectedFunctionInputs">
      <span v-if="input.type === 'variable'">
        <select v-model="item.input[input.name]" class="form-control" :disabled="readOnly">
          <option disabled :value="null">Escolha a variável</option>
          <option v-for="variable in variables" :value="variable.id">{{ variable.name }}</option>
        </select>
      </span>

      <span v-if="input.type === 'agent'">
        <select v-model="item.input[input.name]" class="form-control" :disabled="readOnly">
          <option disabled :value="null">Escolha o agente</option>
          <option v-for="agent in agents" :value="agent.id">{{ agent.name }}</option>
        </select>
      </span>

      <span v-if="input.type === 'string' && input.options">
        <select v-model="item.input[input.name]" class="form-control" :disabled="readOnly">
          <option disabled :value="null" v-if="!input.defaultValue">{{ input.nullLabel }}</option>
          <option v-for="option in input.options" :value="option.value">{{ option.label }}</option>
        </select>
      </span>

      <span v-if="input.type === 'number'">
        <input type="number" v-model="item.input[input.name]" class="form-control" :disabled="readOnly">
      </span>

      <span v-if="input.type === 'string' && !input.options">
        <input type="text" v-model="item.input[input.name]" class="form-control" :disabled="readOnly">
      </span>

      <span v-if="input.type === 'boolean'">
        <label>
          <input type="checkbox" v-model="item.input[input.name]" :disabled="readOnly">
          {{ input.label }}
        </label>
      </span>
    </span>
  </span>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'function-call',
  props: ['value', 'functionTypes', 'emptyLabel', 'readOnly', 'agents', 'variables'],

  data () {
    return {
      item: this.value
    }
  },

  computed: {
    simulationFunctions () {
      return window.simulationFunctions
    },

    availableFunctions () {
      return _(this.simulationFunctions)
        .pickBy(func => this.functionTypes.indexOf(func.type) !== -1)
        .map((func, key) => ({ key: key, data: func }))
        .sortBy(f => f.data.order)
        .value()
    },

    selectedFunctionInputs () {
      return this.item.function ? this.simulationFunctions[this.item.function].input : []
    }
  },

  methods: {
    getFunctionLabel (name) {
      return this.simulationFunctions[name].label
    },

    getAgentName (agentId) {
      return this.agents[agentId].name
    },

    changeFunction () {
      let inputs = this.selectedFunctionInputs
      let previousInput = this.item.input

      // reset input but keep the value if there's an input variable with the same name
      this.item.input = {}
      inputs.forEach(input => {
        this.item.input[input.name] = previousInput[input.name] ? previousInput[input.name] : (input.defaultValue || null)
      })
    }
  }
}
</script>
