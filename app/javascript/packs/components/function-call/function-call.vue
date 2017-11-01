<template>
  <div class="function-call">
    <div class="function-selector" :class="{ 'has-error': !item['function'] && validated }">
      <select class="form-control" v-model="item.function" v-on:change="changeFunction" :disabled="readOnly">
        <option v-if="!item.function" :value="null">{{ emptyLabel }}</option>
        <option v-for="func in availableFunctions" :value="func.key">{{ func.data.label }}</option>
      </select>
    </div>

    <div class="function-inputs" v-if="item['function'] && selectedFunctionInputs.length > 0">
      <div
        class="function-input"
        v-for="input in selectedFunctionInputs"
        :class="{ 'has-error': hasError(input.name) }">
        <div class="input-label">
          <label :class="{ 'sr-only': input.hideLabel }" v-if="input.type !== 'boolean'">
            {{ input.label }}
          </label>
        </div>

        <div class="input-value">
          <span v-if="input.type === 'variable'">
            <select v-model="item.input[input.name]" class="form-control" :disabled="readOnly" v-on:change="revalidate(input.name)">
              <option :disabled="input.required" :value="null">{{ input.nullLabel || 'Escolha a variável' }}</option>
              <option v-for="variable in orderedVariables" :value="variable.id">{{ variable.name }}</option>
            </select>
          </span>

          <span v-if="input.type === 'agent'">
            <select v-model="item.input[input.name]" class="form-control" :disabled="readOnly" v-on:change="revalidate(input.name)">
              <option :disabled="input.required" :value="null">{{ input.nullLabel || 'Escolha o agente' }}</option>
              <option v-for="agent in orderedAgents" :value="agent.id">{{ agent.name }}</option>
            </select>
          </span>

          <span v-if="input.type === 'string' && input.options">
            <select v-model="item.input[input.name]" class="form-control" :disabled="readOnly" v-on:change="revalidate(input.name)">
              <option :disabled="input.required" :value="null" v-if="!input.defaultValue">{{ input.nullLabel }}</option>
              <option v-for="option in input.options" :value="option.value">{{ option.label }}</option>
            </select>
          </span>

          <span v-if="input.type === 'number'">
            <input type="text" v-model="item.input[input.name]" class="form-control" :disabled="readOnly" v-on:change="revalidate(input.name)">
          </span>

          <span v-if="input.type === 'string' && !input.options">
            <input type="text" v-model="item.input[input.name]" class="form-control" :disabled="readOnly" v-on:change="revalidate(input.name)">
          </span>

          <span v-if="input.type === 'boolean'">
            <label class="checkbox-label">
              <input type="checkbox" v-model="item.input[input.name]" :disabled="readOnly" v-on:change="revalidate(input.name)">
              {{ input.label }}
            </label>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import InputValidator from '../../simulation/input-validator'
import SimulationFunctions from '../../simulation/functions'

export default {
  name: 'function-call',
  props: ['value', 'functionTypes', 'emptyLabel', 'readOnly', 'agents', 'variables', 'lastValidation'],

  data () {
    return {
      item: this.addMissingInputs(this.value),
      errors: [],
      mountTime: new Date()
    }
  },

  computed: {
    orderedAgents () {
      return _.orderBy(this.agents, 'name')
    },

    orderedVariables () {
      return _.orderBy(this.variables, 'name')
    },

    simulationFunctions () {
      return SimulationFunctions
    },

    availableFunctions () {
      return _(this.simulationFunctions)
        .pickBy(func => this.functionTypes.indexOf(func.type) !== -1)
        .map((func, key) => ({ key: key, data: func }))
        .sortBy(f => f.data.order)
        .value()
    },

    selectedFunction () {
      let func = this.item['function']
      return func ? this.simulationFunctions[func] : null
    },

    selectedFunctionInputs () {
      return _.get(this.selectedFunction, 'input') || []
    },

    validated () {
      return this.lastValidation && this.lastValidation > this.mountTime
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

      this.errors = []
    },

    revalidate (inputName) {
      let input = _.find(this.selectedFunctionInputs, { name: inputName })

      if (this.hasError(inputName) && InputValidator.isInputValid(this.item.input[inputName], input)) {
        // _.remove doesn't trigger vue.js change detector :|
        this.errors.splice(_.findIndex(this.errors, i => i === inputName), 1)
      }
    },

    hasError (inputName) {
      return _.includes(this.errors, inputName)
    },

    // adds missing inputs setting them to null
    // this is useful when we add new input fields for simulation functions
    // that are already being used in existing projects
    addMissingInputs (value) {
      let func = value['function']

      if (func && SimulationFunctions[func]) {
        if (!value.input) {
          value.input = {}
        }

        let functionInput = SimulationFunctions[func].input || []
        functionInput.forEach(input => {
          if (value.input[input.name] === undefined) {
            value.input[input.name] = null
          }
        })
      }

      return value
    }
  },

  watch: {
    lastValidation (value) {
      if (!value) return

      if (this.selectedFunction) {
        this.errors = InputValidator.getInvalidInputs(this.item.input, this.selectedFunction)
      } else {
        this.errors = []
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.function-inputs {
  margin-top: 5px;
  display: table;
}

.function-input {
  display: table-row;
}

.input-label,
.input-value {
  display: table-cell;
  padding: 3px 0;
}

.input-label {
  text-align: right;
  white-space: nowrap;
  padding-left: 6px;
  padding-right: 6px;

  label {
    font-weight: normal;
  }
}

.has-error .input-label {
  color: #c00;
}

.checkbox-label {
  font-weight: normal;
}
</style>
