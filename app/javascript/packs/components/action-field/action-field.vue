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
                  empty-label="Escolha uma ação"></function-call>
              </div>

              <a class="remove" v-on:click="destroyAction(index, $event)" href="" v-if="!readOnly">
                <span class="glyphicon glyphicon-remove-circle" title="Remover ação"></span>
                <span class="sr-only">Remover ação</span>
              </a>
            </div>

            <div class="clearfix"></div>
          </div>
      </draggable>
    </div>

    <a href="" v-on:click="addAction($event)" class="btn btn-sm btn-default" v-if="!readOnly">
      <span class="glyphicon glyphicon-plus-sign"></span>
      Adicionar ação
    </a>
  </div>
</template>

<script>
import FunctionCall from '../function-call/function-call.vue'
import draggable from 'vuedraggable'
import uuid from 'uuid/v4'

export default {
  name: 'action-field',
  replace: false,
  props: ['value', 'agents', 'variables', 'readOnly'],

  data () {
    return {
      actions: this.applyId(this.value || []),
      dragging: false
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
    addAction ($event) {
      if ($event) $event.preventDefault()

      this.actions.push({
        id: uuid(),
        function: null,
        input: {},
        negate: false
      })
    },

    destroyAction (index, $event) {
      if ($event) $event.preventDefault()

      if (!this.actions[index].function || window.confirm('Tem certeza que deseja remover esta ação?')) {
        this.actions.splice(index, 1)
      }
    },

    validate () {
      // TO-DO: implement
      return true
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

    .remove {
      display: block;
      float: right;
      height: 26px;
      color: #c00;
      text-decoration: none;
      font-size: 18px;
      opacity: 0.3;
      vertical-align: top;
      border-left: 1px solid rgba(0, 0, 0, .2);
      margin: 0 3px 0 8px;
      padding: 2px 0 0 8px;
      transition: opacity .1s linear;

      &:hover {
        opacity: 1;
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
