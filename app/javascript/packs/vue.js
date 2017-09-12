/* eslint no-console: 0 */
import Vue from 'vue/dist/vue.esm'
import ActionField from './components/action-field/action-field.vue'
import ConditionField from './components/condition-field/condition-field.vue'

document.addEventListener('turbolinks:load', () => {
  window.vue = new Vue({
    el: '#vue-container',
    components: { ActionField, ConditionField }
  })
})
