<template>
  <div class="condition child" v-bind:class="{ negated: itemData.negate }">
    <div class="horizontal-line"></div>

    <content>
      <function-call
        :value="itemData"
        :read-only="readOnly"
        :function-types="functionTypes"
        empty-label="Escolha uma condição"></function-call>

      <a class="negate" v-on:click="negate($event)" href="" v-if="showNegateFunction">
        <span class="glyphicon glyphicon-exclamation-sign" title="Negar condição"></span>
        <span class="sr-only">Negar condição</span>
      </a>

      <a class="remove" v-on:click="destroy($event)" href="" v-if="!readOnly">
        <span class="glyphicon glyphicon-remove-circle" title="Remover condição"></span>
        <span class="sr-only">Remover condição</span>
      </a>
    </content>

    <div class="clearfix"></div>
  </div>
</template>

<script>
import FunctionCall from '../function-call/function-call.vue'

let simulationFunctions = window.simulationFunctions

export default {
  name: 'condition-function-call',
  props: ['item', 'index', 'functionTypes', 'readOnly'],

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
    }
  },

  methods: {
    negate ($event) {
      if ($event) $event.preventDefault()
      this.itemData.negate = !this.itemData.negate
    },

    destroy ($event) {
      if ($event) $event.preventDefault()

      if (!this.itemData.function || window.confirm('Tem certeza que deseja remover esta condição?')) {
        this.$emit('destroy', this.index)
      }
    }
  }
}
</script>
