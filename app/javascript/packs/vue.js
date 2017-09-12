/* eslint no-console: 0 */
import Vue from 'vue/dist/vue.esm'
import ActionField from './components/action-field/action-field.vue'
import ConditionField from './components/condition-field/condition-field.vue'

const components = {
  ActionField,
  ConditionField
}

function loadComponents() {
  let container = document.querySelector('#vue-container')

  if (container) {
    window.vue = new Vue({
      el: container,
      components: components
    })
  }
}

document.addEventListener('turbolinks:load', loadComponents)
document.addEventListener('simula:reload-project', loadComponents)
