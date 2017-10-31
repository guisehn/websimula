import _ from 'lodash'

const modalTemplate = _.template(`
  <div class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Aviso de conflito</h4>
        </div>
        <div class="modal-body">
          <p><%= content %></p>
          <p>Clique no botão <b>Recarregar</b> para carregar as alterações, ou em <b>Cancelar</b> para prosseguir
          com as suas alterações. Caso deseja prosseguir com as suas alterações sem recarregar, as alterações
          feitas pelo outro usuário poderão ser perdidas.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-action="reload">Recarregar</button>
          <button type="button" class="btn btn-default" data-dismiss="modal">Fechar</button>
        </div>
      </div>
    </div>
  </div>
`.trim())

export default class ConflictChecker {
  constructor () { }

  setUrl(url) {
    this.url = url
  }

  setCurrentUserId(currentUserId) {
    this.currentUserId = currentUserId
  }

  check(data) {
    if (this.isDifferentEditor(data)) {
      this.rulePageCheck(data)
      this.initialPositionsCheck(data)
      this.stopConditionCheck(data)
    }
  }

  rulePageCheck(data) {
    let m = window.location.pathname.match(/^\/projects\/[0-9]+\/agents\/[0-9]+\/rules\/([0-9]+)\//)

    if (m && parseInt(m[1], 10) === data.id) {
      let editor = this.editorName(data)
      this.showConflictMessage(`Esta regra foi modificada por <b>${editor}</b> enquanto você está com esta tela aberta.`)
    }
  }

  initialPositionsCheck(data) {
    let m = window.location.pathname.match(/^\/projects\/[0-9]+\/initial_positions\/edit/)

    if (m && _.includes(data.changes, 'initial_positions')) {
      let editor = this.editorName(data)
      this.showConflictMessage(`As posições iniciais dos agentes foram modificadas por <b>${editor}</b> enquanto você está com esta tela aberta.`)
    }
  }

  stopConditionCheck(data) {
    let m = window.location.pathname.match(/^\/projects\/[0-9]+\/stop_condition\/edit/)

    if (m && _.includes(data.changes, 'stop_condition')) {
      let editor = this.editorName(data)
      this.showConflictMessage(`A condição de parada da simulação foi modificada por <b>${editor}</b> enquanto você está com esta tela aberta.`)
    }
  }

  isDifferentEditor(data) {
    return !data.edited_by || data.edited_by.id !== this.currentUserId
  }

  editorName(data) {
    return _.escape(data.edited_by ? data.edited_by.name : 'Sistema')
  }

  showConflictMessage(content) {
    if (this.modal) {
      this.modal.modal('hide')
      this.modal = null
    }

    setTimeout(() => {
      let modalHtml = modalTemplate({ content: content })
      this.modal = $(modalHtml).appendTo('body')

      this.modal.modal({ backdrop: 'static' })
      this.modal.find('[data-action=reload]').click(() => this.reloadPage())
    }, 500)
  }

  reloadPage() {
    Turbolinks.clearCache()
    Turbolinks.visit(location.toString())
  }
}
