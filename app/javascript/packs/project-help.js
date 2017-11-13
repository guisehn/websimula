import _ from 'lodash'

const modalTemplate = _.template(`
  <div class="project-help-modal modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h4 class="modal-title">Precisa de ajuda?</h4>
        </div>
        <div class="modal-body">
          <% if (firstAccess) { %>
          <p>
            Vimos que é primeira vez acessando este projeto.
          </p>
          <% } %>

          <p>
            Se você precisar de ajuda, clique no botão abaixo para assistir a um vídeo
            explicando como modelar um projeto de simulação de exemplo.
          </p>

          <div class="play-button-container">
            <a href=""
              class="btn btn-lg btn-default" target="_blank" data-action="watch-video">
              <span class="glyphicon glyphicon-play"></span>
              Assistir vídeo
            </a>
          </div>

          <p>
            Você pode acessar o vídeo novamente mais tarde clicando no ícone <b>Ajuda</b>,
            no canto superior direito da página do projeto.
          </p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-action="close">
            Fechar e acessar o projeto
          </button>
        </div>
      </div>
    </div>
  </div>
`.trim())

const modalContainerId = 'simula-project-welcome-modal-container'

export default {
  open(projectId, firstAccess) {
    let modalHtml = modalTemplate({ firstAccess })
    let modalContainer = $('#' + modalContainerId)

    if (!modalContainer.length) {
      modalContainer = $(`<div id="${modalContainerId}"></div>`).appendTo('body')
    }

    modalContainer.html('')

    let modal = $(modalHtml).appendTo(modalContainer)
    modal.modal({ backdrop: 'static' })

    let self = this

    modal.find('[data-action=watch-video]').click(function (e) {
      self.openVideo()
      e.preventDefault()
    })

    modal.find('[data-action=close]').click(function (e) {
      if (firstAccess) {
        self.updateFirstAccess(projectId, false)
      }

      modal.modal('hide')
      e.preventDefault()
    })
  },

  openVideo() {
    let dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left
    let dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top

    let screenWidth = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width
    let screenHeight = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height

    let width = screen.width - 100
    let height = screen.height - 100

    let left = ((screenWidth / 2) - (width / 2)) + dualScreenLeft
    let top = ((screenHeight / 2) - (height / 2)) + dualScreenTop

    let url = '/projects/tutorial?autoplay=1'

    let newWindow = window.open(url, 'project_help_video',
      `scrollbars=no, width=${width}, height=${height}, top=${top}, left=${left}`)

    if (window.focus) {
      newWindow.focus()
    }
  },

  updateFirstAccess(projectId, value) {
    $.ajax({
      type: 'PUT',
      url: `/projects/${projectId}/first_access`,
      dataType: 'json',
      data: { first_access: value }
    })
  }
}
