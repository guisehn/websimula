/* eslint no-console: 0 */
import Vue from 'vue/dist/vue.esm'

import ActionField from './components/action-field/action-field.vue'
import ConditionField from './components/condition-field/condition-field.vue'
import InitialPositionsField from './components/initial-positions-field/initial-positions-field.vue'

const components = {
  ActionField,
  ConditionField,
  InitialPositionsField
}

function loadComponents() {
  let container = document.querySelector('#vue-container')

  if (window.vue) {
    window.vue.$destroy()
    window.vue = undefined
  }

  if (container) {
    window.vue = new Vue({
      el: container,
      components: components
    })
  }
}

document.addEventListener('turbolinks:load', loadComponents)
document.addEventListener('simula:reload-project', loadComponents)
