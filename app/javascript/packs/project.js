import _ from 'lodash'

let currentProjectId = null

function updateBindings(modelName, model) {
  _.forEach(model, (value, key) => {
    // skip keys starting with _
    if (key[0] === '_') return;

    let selector = `[data-bind=${modelName}-${key.replace(/_/g, '-')}][data-model-id=${model.id}]`

    $(selector).each(function () {
      let label = model[`_${key}_label`] ? model[`_${key}_label`] : value
      let bindAttribute = $(this).data('bind-attribute')
      let currentValue = bindAttribute ? $(this).attr(bindAttribute) : $(this).text();
      let valueUsed = $(this).data('use-original-value') ? value : label
      var htmlSafe = $(this).data('html-safe')

      if (currentValue !== String(valueUsed)) {
        if (bindAttribute) {
          $(this).attr(bindAttribute, valueUsed)
        } else if (this.tagName.toLowerCase() === 'textarea') {
          $(this).val(valueUsed)
        } else if (htmlSafe) {
          $(this).html(valueUsed)
        } else {
          $(this).text(valueUsed)
        }

        $(this).hide().fadeIn(500)
      }

      if ($(this).data('editable')) {
        $(this).editable('setValue', value)
      }
    })
  })
}

function activateDescriptionField() {
  let section = $('#description-section')

  section.on('click', '[data-action=edit]', e => {
    section.find('.view-mode').hide()
    section.find('.edit-mode').show().find('textarea').focus()

    e.preventDefault()
  })

  section.on('click', '[data-action=cancel]', e => {
    section.find('.view-mode').show()
    section.find('.edit-mode').hide()

    e.preventDefault()
  })
}

// TODO: refactor
function rulePageCheck(data) {
  let ruleId = data.id
  let editedBy = data.edited_by
  let match = window.location.pathname.match(/^\/projects\/[0-9]+\/agents\/[0-9]+\/rules\/([0-9]+)\//)

  if (match && match[1] == ruleId && editedBy.id !== window.simulaUserId) {
    let message = `Esta regra foi modificada por ${editedBy.name} enquanto você está com esta página ` +
      `aberta. Clique em OK para recarregar a regra ou cancelar para continuar editando. Se você continuar ` +
      `editando, poderá sobrescrever as mudanças feitas por ${editedBy.name}.`

    if (confirm(message)) {
      location.reload()
    }
  }
}

// TODO: refactor
function initialPositionsCheck(data) {
  let ruleId = data.id
  let editedBy = data.edited_by
  let match = window.location.pathname.match(/^\/projects\/[0-9]+\/initial_positions\/edit/)

  if (match && editedBy.id !== window.simulaUserId && _.includes(data.changes, 'initial_positions')) {
    let message = `A condição de parada foi modificada por ${editedBy.name} enquanto você ` +
      `está com esta página aberta. Clique em OK para recarregar a condição de parada ` +
      `ou cancelar para continuar editando. Se você continuar editando, poderá sobrescrever as ` +
      `mudanças feitas por ${editedBy.name}.`

    if (confirm(message)) {
      location.reload()
    }
  }
}

// TODO: refactor
function stopConditionCheck(data) {
  let ruleId = data.id
  let editedBy = data.edited_by
  let match = window.location.pathname.match(/^\/projects\/[0-9]+\/stop_condition\/edit/)

  if (match && editedBy.id !== window.simulaUserId && _.includes(data.changes, 'stop_condition')) {
    let message = `A posição inicial dos agentes foi modificada por ${editedBy.name} enquanto você ` +
      `está com esta página aberta. Clique em OK para recarregar a posição inicial dos agentes ` +
      `ou cancelar para continuar editando. Se você continuar editando, poderá sobrescrever as ` +
      `mudanças feitas por ${editedBy.name}.`

    if (confirm(message)) {
      location.reload()
    }
  }
}

$(document).on('turbolinks:load', function () {
  let projectId = window.location.pathname.match(/^\/projects\/([0-9]+)/)
  projectId = projectId ? projectId[1] : null

  activateDescriptionField()

  if (!projectId || projectId !== currentProjectId) {
    App.cable.subscriptions.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })

    currentProjectId = null
  }

  if (projectId) {
    currentProjectId = projectId

    App.cable.subscriptions.create({
      channel: 'ProjectChannel',
      project_id: projectId
    }, {
      connected: () => {
        console.log(`Project ${projectId}: connected`)
      },

      rejected: () => {
        console.log(`Project ${projectId}: rejected`)
      },

      received: (data) => {
        if (data.model === 'Project') {
          $.get(`/projects/${projectId}.json`, project => {
            updateBindings('project', project)

            $('#stop-condition-section').load(`/projects/${projectId}/stop_condition`, () => {
              document.dispatchEvent(new Event('simula:reload-project'))
            })
          })

          initialPositionsCheck(data)
          stopConditionCheck(data)
        }

        if (data.model === 'Agent') {
          $('#agents-section').load(`/projects/${projectId}/agents`)

          $.get(`/projects/${projectId}/agents/${data.id}.json`, agent => {
            updateBindings('agent', agent)
          })
        }

        if (data.model === 'Variable') {
          $('#variables-section').load(`/projects/${projectId}/variables`)
        }

        if (data.model === 'Rule') {
          rulePageCheck(data)
        }

        console.log(`Project ${projectId}: received`, data)
      }
    })
  }
})
