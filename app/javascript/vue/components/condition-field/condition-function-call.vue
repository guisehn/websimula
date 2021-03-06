<template>
  <div class="condition child" v-bind:class="{ negated: itemData.negate }">
    <div class="horizontal-line"></div>

    <content>
      <div class="function-call-container">
        <function-call
          :value="itemData"
          :read-only="readOnly"
          :function-types="functionTypes"
          :agents="agents"
          :variables="variables"
          :last-validation="lastValidation"
          empty-label="Escolha uma condição"></function-call>
      </div>

      <div class="actions">
        <a class="help" v-on:click.prevent="help()" href="" v-if="showHelp">
          <span class="glyphicon glyphicon-question-sign" title="Ajuda"></span>
          <span class="sr-only">Ajuda</span>
        </a>

        <a class="negate" v-on:click.prevent="negate()" href="" v-if="showNegateFunction">
          <span class="glyphicon glyphicon-exclamation-sign" title="Negar condição"></span>
          <span class="sr-only">Negar condição</span>
        </a>

        <a class="remove" v-on:click.prevent="destroy()" href="" v-if="!readOnly">
          <span class="glyphicon glyphicon-remove-circle" title="Remover condição"></span>
          <span class="sr-only">Remover condição</span>
        </a>
      </div>

      <div class="clearfix"></div>
    </content>

    <div class="clearfix"></div>
  </div>
</template>

<script>
import FunctionCall from '../function-call/function-call.vue'

import SimulationFunctions from '../../../simulation/functions'
import FunctionHelp from '../../../simulation/function-help'

export default {
  name: 'condition-function-call',
  props: ['item', 'index', 'functionTypes', 'readOnly', 'agents', 'variables', 'lastValidation'],

  data () {
    return {
      itemData: this.item
    }
  },

  components: {
    FunctionCall
  },

  computed: {
    showNegateFunction () {
      return this.itemData.function && !this.readOnly
    },

    showHelp () {
      let func = this.itemData.function
      return func && SimulationFunctions[func].help
    }
  },

  methods: {
    help () {
      FunctionHelp.open(this.itemData.function, this.agents, this.variables)
    },

    negate () {
      this.itemData.negate = !this.itemData.negate
    },

    destroy () {
      if (!this.itemData.function || window.confirm('Tem certeza que deseja remover esta condição?')) {
        this.$emit('destroy', this.index)
      }
    }
  }
}
</script>
