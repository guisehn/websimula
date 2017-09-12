<template>
  <div class="condition-group" v-bind:class="{ child: !isRoot, and: itemData.operator === 'and', or: itemData.operator === 'or' }">
    <div class="horizontal-line"></div>

    <header>
      <select class="form-control" v-model="itemData.operator">
        <option value="and">Todas as condições precisam ser satisfeitas (E)</option>
        <option value="or">Qualquer uma das condições podem ser satisfeitas (OU)</option>
      </select>

      <a class="remove" v-on:click="destroy($event)" href="">
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
          @update="updateChild"
          @destroy="destroyChild"></condition-function-call>

        <condition-logical-operator
          v-if="child.type === 'logical_operator'"
          :level="level + 1"
          :index="index"
          :item="child"
          @update="updateChild"
          @destroy="destroyChild"></condition-logical-operator>
      </div>

      <div class="add-section">
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
  props: ['index', 'item', 'level'],

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
