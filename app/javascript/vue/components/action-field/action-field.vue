<template>
  <div class="edit-rule-action-field" :class="{ 'drag-allowed': isDragAllowed }">
    <div v-if="!actions.length" class="empty">
      <p>Nenhuma ação (o agente irá ficar parado).</p>
    </div>

    <div v-if="actions.length">
      <draggable
        v-model="actions"
        @start="dragging = true"
        @end="dragging = false"
        :options="{ handle: '.handle', animation: 150, disabled: !isDragAllowed }">
          <div v-for="(action, index) in actions" :key="action.id">
            <div class="action" :class="{ 'dragging': dragging }">
              <span class="handle">
                <span class="order">#{{ index + 1 }}</span>
                <span class="handle-icon glyphicon glyphicon-th"></span>
              </span>

              <div class="function-call-container">
                <function-call
                  :readOnly="readOnly"
                  :value="action"
                  :function-types="['action']"
                  :agents="agents"
                  :variables="variables"
                  :last-validation="lastValidation"
                  empty-label="Escolha uma ação"></function-call>
              </div>

              <div class="actions">
                <a class="help" v-on:click.prevent="help(index)" href="" v-if="shouldShowHelp(index)">
                  <span class="glyphicon glyphicon-question-sign" title="Ajuda"></span>
                  <span class="sr-only">Ajuda</span>
                </a>

                <a class="remove" v-on:click.prevent="destroyAction(index)" href="" v-if="!readOnly">
                  <span class="glyphicon glyphicon-remove-circle" title="Remover ação"></span>
                  <span class="sr-only">Remover ação</span>
                </a>
              </div>
            </div>

            <div class="clearfix"></div>
          </div>
      </draggable>
    </div>

    <a href="" v-on:click.prevent="addAction()" class="btn btn-sm btn-default" v-if="!readOnly">
      <span class="glyphicon glyphicon-plus-sign"></span>
      Adicionar ação
    </a>
  </div>
</template>

<script>
import FunctionCall from '../function-call/function-call.vue'
import InputValidator from '../../../simulation/input-validator'
import SimulationFunctions from '../../../simulation/functions'
import FunctionHelp from '../../../simulation/function-help'

import draggable from 'vuedraggable'
import uuid from 'uuid/v4'

export default {
  name: 'action-field',
  replace: false,
  props: ['value', 'agents', 'variables', 'readOnly'],

  data () {
    return {
      actions: this.applyId(this.value || []),
      dragging: false,
      lastValidation: null
    }
  },

  components: {
    FunctionCall,
    draggable
  },

  computed: {
    isDragAllowed () {
      return this.actions.length > 1
    }
  },

  methods: {
    addAction () {
      this.actions.push({
        id: uuid(),
        function: null,
        input: {},
        input_types: {},
        negate: false
      })
    },

    shouldShowHelp (index) {
      let func = this.actions[index]['function']
      return func && SimulationFunctions[func].help
    },

    help (index) {
      let action = this.actions[index]
      FunctionHelp.open(action.function, this.agents, this.variables)
    },

    destroyAction (index) {
      if (!this.actions[index].function || window.confirm('Tem certeza que deseja remover esta ação?')) {
        this.actions.splice(index, 1)
      }
    },

    validate (callback) {
      // triggers validation on child components
      this.lastValidation = new Date()

      // checks if there is any invalid field
      let hasInvalidAction = _.some(this.actions, action => {
        if (!action.function) return true

        let invalidInputs = InputValidator.getInvalidInputs(action.input, SimulationFunctions[action.function])

        return invalidInputs.length > 0
      })

      return !hasInvalidAction
    },

    getData () {
      return this.removeId(_.cloneDeep(this.actions))
    },

    reset () {
      this.actions = []
    },

    applyId (actions) {
      actions.forEach(action => { action.id = uuid() })
      return actions
    },

    removeId (actions) {
      actions.forEach(action => { delete action.id })
      return actions
    }
  }
}
</script>

<style lang="scss">
.edit-rule-action-field {
  .sortable-ghost {
    opacity: 0;
  }

  .action {
    float: left;
    background: #eee;
    border: 1px solid rgba(0, 0, 0, .1);
    border-radius: 4px;
    margin-bottom: 6px;
    padding: 7px;

    .actions {
      float: right;
      border-left: 1px solid rgba(0, 0, 0, .2);
      margin-right: 4px;
      margin-left: 8px;

      .remove,
      .help {
        display: inline-block;
        height: 26px;
        text-decoration: none;
        font-size: 18px;
        opacity: 0.3;
        vertical-align: top;
        padding: 2px 0 0 8px;
        transition: opacity .1s linear;

        &:hover {
          opacity: 1;
        }
      }

      .remove {
        color: #c00;
      }

      .help {
        color: #069;
      }
    }

    .form-control {
      display: inline-block;
      width: auto;
      height: 26px;
      padding: 2px 4px;
    }

    .function-call-container {
      float: left;
    }

    .handle {
      float: left;
      display: block;
      width: 34px;
      height: 26px;
      text-align: center;
      vertical-align: top;
      color: #666;
      font-size: 16px;
      border-right: 1px solid #ccc;
      margin-right: 6px;
      padding-top: 1px;
      padding-right: 6px;

      .handle-icon { display: none; }
    }
  }

  &.drag-allowed .action .handle {
    cursor: move;
  }
}
</style>
