import _ from 'lodash'
import SimulationFunctions from './functions'

const modalTemplate = _.template(`
  <div class="function-help-modal modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title">Função "<%- func.label %>"</h4>
        </div>
        <div class="modal-body">
          <%= content %>
          <div class="clearfix"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>
`.trim())

const modalContainerId = 'simula-help-modal-container'

export default {
  open: (functionName, agents, variables) => {
    let func = SimulationFunctions[functionName]

    let modalHtml = modalTemplate({
      func: func,
      content: func.help()
    })

    let modalContainer = $('#' + modalContainerId)

    if (!modalContainer.length) {
      modalContainer = $(`<div id="${modalContainerId}"></div>`).appendTo('body')
    }

    modalContainer.html('')

    let modal = $(modalHtml).appendTo(modalContainer)
    modal.modal()
  }
}
