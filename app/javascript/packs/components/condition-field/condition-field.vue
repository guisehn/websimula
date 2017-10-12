<template>
  <div class="edit-rule-condition-field">
    <div v-if="!item" class="empty">
      <p>{{ noConditionMessage }}</p>

      <a href="" v-on:click.prevent="addCondition()" v-if="!readOnly" class="btn btn-sm btn-default">
        <span class="glyphicon glyphicon-plus-sign"></span>
        Adicionar condição
      </a>
    </div>

    <div v-if="item">
      <condition-logical-operator
        :item="item"
        :level="1"
        :function-types="functionTypes"
        :agents="agents"
        :variables="variables"
        :read-only="readOnly"
        :last-validation="lastValidation"
        @destroy="reset"></condition-logical-operator>

      <p class="help-block" v-if="helpMessage">
        {{ helpMessage }}
      </p>
    </div>
  </div>
</template>

<script>
import ConditionLogicalOperator from './condition-logical-operator.vue'
import InputValidator from '../../simulation/input-validator'

import uuid from 'uuid/v4'
import _ from 'lodash'

export default {
  name: 'condition-field',
  replace: false,
  props: ['value', 'functionTypes', 'agents', 'variables',
    'noConditionMessage', 'helpMessage', 'readOnly'],

  data () {
    let value = this.value

    if (value && value.type !== 'logical_operator') {
      value = { type: 'logical_operator', operator: 'and', children: [value] }
    }

    return {
      item: value ? this.applyId(value) : null,
      lastValidation: null
    }
  },

  components: {
    ConditionLogicalOperator
  },

  methods: {
    addCondition () {
      this.item = this.applyId({
        type: 'logical_operator',
        operator: 'and',
        children: [
          { type: 'function_call', function: null, input: {}, negate: false }
        ]
      })
    },

    reset () {
      this.item = null
    },

    validate () {
      // triggers validation on child components
      this.lastValidation = new Date()

      let validateObject = (obj) => {
        if (obj.type === 'function_call') {
          let func = obj['function'] ? window.simulationFunctions[obj.function] : null

          if (func) {
            let invalidInputs = InputValidator.getInvalidInputs(obj.input, func)
            return invalidInputs.length === 0
          } else {
            return false
          }
        }

        if (obj.type === 'logical_operator') {
          return _.every(obj.children, c => validateObject(c))
        }
      }

      return this.item ? validateObject(this.item) : true
    },

    getData () {
      return this.item ? this.removeId(_.cloneDeep(this.item)) : null
    },

    applyId (item) {
      if (!item.id) {
        item.id = uuid()
      }

      if (item.children) {
        item.children.forEach(child => this.applyId(child))
      }

      return item
    },

    removeId (item) {
      if (item.id) {
        delete item.id
      }

      if (item.children) {
        item.children.forEach(child => this.removeId(child))
      }

      return item
    }
  }
}
</script>

<style lang="scss">
.edit-rule-condition-field {
  .condition-group {
    .form-control {
      width: auto;
      display: inline-block;
      padding: 2px 4px;
      height: 26px;
    }

    .remove,
    .negate {
      display: inline-block;
      height: 26px;
      color: #c00;
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

    .actions {
      float: right;
      border-left: 1px solid rgba(0, 0, 0, .2);
      margin-right: 4px;
      margin-left: 8px;
    }

    > header {
      float: left;
      transition: background-color .1s linear;
      border: 1px solid rgba(0, 0, 0, .1);
      border-radius: 4px;
      padding: 7px;
    }

    &.root.read-only.one-child-only {
      > header {
        display: none;
      }

      > content {
        margin-left: 0;
        border-left: 0;

        .condition {
          border: 0;

          .horizontal-line {
            display: none;
          }
        }
      }

      .child {
        margin-left: 0;
      }
    }

    &.or > header {
      background-color: #ffe79e;
    }

    &.and > header {
      background-color: #d2e7c0;
    }

    > content {
      clear: both;
      display: block;
      margin-left: 16px;
      border-left: 2px dotted #ddd;
    }

    &.child > content {
      margin-left: 32px;
    }

    .child {
      min-height: 20px;
      border-left: 2px solid #ddd;
      margin-left: -2px;
      padding-top: 10px;

      > .horizontal-line {
        float: left;
        display: block;
        width: 16px;
        vertical-align: top;
        border-top: 2px solid #ddd;
        margin-top: 20px;
      }
    }

    .condition {
      > content {
        float: left;
        border-radius: 4px;
        display: block;
        background-color: #eee;
        transition: opacity .1s linear;
        border: 1px solid rgba(0, 0, 0, .1);
        padding: 7px;
        vertical-align: top;

        > .function-call-container {
          float: left;
        }

        @media (min-width: 769px) and (max-width: 992px) {
          max-width: 600px;

          .form-control {
            margin-bottom: 5px;
          }
        }

        @media (max-width: 768px) {
          width: calc(100% - 20px);
        }
      }

      &.negated > content {
        background-color: #eacbcb;

        .negate {
          opacity: 0.8;

          &:hover { opacity: 1; }
        }
      }
    }

    .add-section {
      padding-top: 30px;

      .horizontal-line {
        width: 18px;
        height: 30px;
        background: #fff;
        display: block;
        float: left;
        border-top: 2px dotted #ddd;
        margin-left: -2px;
      }

      .button-dropdown-container {
        float: left;
        margin-top: -14px;
      }

      .add-button {
        display: block;
        height: 30px;
        background: #fff;
        font-size: 12px;
        border: 2px dotted #ddd;
        padding: 6px 10px;

        &:hover {
          background: #eee;
          border-style: solid;
          border-radius: 2px;
        }

        &[aria-expanded=true] {
          outline: 0;
          background: #ddd;
          box-shadow: 0 1px 1px rgba(0, 0, 0, .2) inset;
          border-color: #bbb;
          border-style: solid;
          border-radius: 2px;
        }
      }
    }
  }

  .read-only-line-eraser {
    background: #fff;
    width: 2px;
    height: 23px;
    margin-top: -21px;
    margin-left: -2px;
  }
}
</style>
