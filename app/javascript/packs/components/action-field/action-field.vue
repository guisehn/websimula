<template>
  <div class="edit-rule-action-field">
    <div v-if="!actions.length" class="empty">
      <p>Nenhuma ação (o agente irá ficar parado).</p>
    </div>

    <div v-if="actions.length">
      <div v-for="(action, index) in actions" :key="action.id">
        <div class="action">
          <span class="order">#{{ index + 1 }}</span>

          <function-call :value="action" function-type="action"></function-call>

          <a class="remove" v-on:click="destroyAction(index, $event)" href="">
            <span class="glyphicon glyphicon-remove-circle" title="Remover ação"></span>
            <span class="sr-only">Remover ação</span>
          </a>
        </div>

        <div class="clearfix"></div>
      </div>
    </div>

    <a href="" v-on:click="addAction($event)" class="btn btn-sm btn-default">
      <span class="glyphicon glyphicon-plus-sign"></span>
      Adicionar ação
    </a>
  </div>
</template>

<script>
import FunctionCall from '../function-call/function-call.vue'
import uuid from 'uuid/v4'

export default {
  name: 'action-field',
  replace: false,
  props: ['value'],

  data () {
    return {
      actions: this.applyId(this.value || [])
    }
  },

  components: {
    FunctionCall
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
  .action {
    float: left;
    background: #eee;
    border: 1px solid rgba(0, 0, 0, .1);
    border-radius: 4px;
    margin-bottom: 6px;
    padding: 7px;

    .remove {
      display: inline-block;
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
    }

    .order {
      display: inline-block;
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
    }
  }
}
</style>
