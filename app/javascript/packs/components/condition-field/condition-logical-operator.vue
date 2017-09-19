<template>
  <div class="condition-group" v-bind:class="{ 'root': isRoot, 'child': !isRoot, 'and': itemData.operator === 'and', 'or': itemData.operator === 'or', 'one-child-only': itemData.children.length === 1, 'read-only': readOnly }">
    <div class="horizontal-line"></div>

    <header>
      <select class="form-control" v-model="itemData.operator" v-if="!readOnly">
        <option value="and">{{ andLabel }}</option>
        <option value="or">{{ orLabel }}</option>
      </select>

      <span class="read-only-label" v-if="readOnly">
        <span v-if="itemData.operator === 'and'">{{ andLabel }}</span>
        <span v-if="itemData.operator === 'or'">{{ orLabel }}</span>
      </span>

      <a class="remove" v-on:click="destroy($event)" href="" v-if="!readOnly">
        <span class="glyphicon glyphicon-remove-circle" v-bind:title="destroyLabel"></span>
        <span class="sr-only">{{ destroyLabel }}</span>
      </a>
    </header>

    <div class="clearfix"></div>

    <content>
      <div v-for="(child, index) in itemData.children" :key="child.id">
        <condition-function-call
          v-if="child.type === 'function_call'"
          :index="index"
          :item="child"
          :function-types="functionTypes"
          :read-only="readOnly"
          :agents="agents"
          :variables="variables"
          @update="updateChild"
          @destroy="destroyChild"></condition-function-call>

        <condition-logical-operator
          v-if="child.type === 'logical_operator'"
          :level="level + 1"
          :index="index"
          :item="child"
          :read-only="readOnly"
          :function-types="functionTypes"
          :agents="agents"
          :variables="variables"
          @update="updateChild"
          @destroy="destroyChild"></condition-logical-operator>
      </div>

      <div class="read-only-line-eraser" v-if="readOnly"></div>

      <div class="add-section" v-if="!readOnly">
        <div class="horizontal-line"></div>

        <div class="button-dropdown-container">
          <div class="dropdown">
            <button class="add-button" data-toggle="dropdown">
              Adicionar
              <span class="caret"></span>
            </button>

            <ul class="dropdown-menu">
              <li><a href="" v-on:click="addFunctionCall($event)">Adicionar condição</a></li>
              <li><a href="" v-on:click="addLogicalOperator($event)" v-if="isAddLogicalOperatorAllowed">Adicionar grupo de condições</a></li>
            </ul>
          </div>
        </div>

        <div class="clearfix"></div>
      </div>
    </content>
  </div>
</template>

<script>
import ConditionFunctionCall from './condition-function-call.vue'
import uuid from 'uuid/v4'

export default {
  name: 'condition-logical-operator',
  props: ['index', 'item', 'level', 'functionTypes', 'readOnly', 'agents', 'variables'],

  data () {
    return {
      isRoot: this.index === undefined,
      itemData: this.item
    }
  },

  components: {
    ConditionFunctionCall
  },

  computed: {
    andLabel () {
      return 'Todas as condições precisam ser satisfeitas (E)'
    },

    orLabel () {
      return 'Qualquer uma das condições podem ser satisfeitas (OU)'
    },

    destroyLabel () {
      return this.isRoot ? 'Remover todas as condições' : 'Remover grupo'
    },

    confirmDestroyMessage () {
      return this.isRoot
        ? 'Tem certeza que deseja remover todas as condições desta regra? Com isso, a regra sempre será executada.'
        : 'Tem certeza que deseja remover este grupo de condições?'
    },

    isAddLogicalOperatorAllowed () {
      return this.level < 5
    }
  },

  methods: {
    addFunctionCall ($event) {
      if ($event) $event.preventDefault()

      this.itemData.children.push({
        id: uuid(),
        type: 'function_call',
        function: null,
        input: {},
        negate: false
      })
    },

    addLogicalOperator ($event) {
      if ($event) $event.preventDefault()

      this.itemData.children.push({
        id: uuid(),
        type: 'logical_operator',
        operator: 'and',
        children: []
      })
    },

    updateChild (obj) {
      this.itemData.children[obj.index] = obj.item
    },

    destroyChild (index) {
      this.itemData.children.splice(index, 1)
    },

    destroy ($event) {
      if ($event) $event.preventDefault()

      if (this.itemData.children.length === 0 || window.confirm(this.confirmDestroyMessage)) {
        this.$emit('destroy', this.index)
      }
    },

    log () {
      console.log(JSON.stringify(this.itemData, null, 2))
    }
  }
}
</script>
