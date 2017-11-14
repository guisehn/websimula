import _ from 'lodash'
import ConflictChecker from './conflict-checker'
import ProjectHelp from './project-help'

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

function updateAgentRulesTable(data) {
  let m = window.location.pathname.match(/^\/projects\/([0-9]+)\/agents\/([0-9]+)/)

  if (m && m[2] == data.agent_id) {
    $('#agent-rules').load(`/projects/${m[1]}/agents/${data.agent_id}/rules`)
  }
}

function showProjectHelpModal(projectId, firstAccess) {
  ProjectHelp.open(projectId, firstAccess)
}

let conflictChecker = new ConflictChecker()

$(document).on('turbolinks:load', function () {
  conflictChecker.setUrl(window.location.pathname)
  conflictChecker.setCurrentUserId(window.simulaUserId)

  activateDescriptionField()

  let projectId = window.location.pathname.match(/^\/projects\/([0-9]+)/)
  projectId = projectId ? projectId[1] : null

  let changedProject = false

  if (!projectId || projectId !== currentProjectId) {
    App.cable.subscriptions.subscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })

    currentProjectId = null
    changedProject = true
  }

  if (projectId) {
    currentProjectId = projectId
  }

  if (changedProject && projectId) {
    if (window.projectFirstAccess) {
      showProjectHelpModal(projectId, true)
    }

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

            // TODO: refactor, make it parallel, only reload if initial position/stop condition actually changes
            $('#initial-positions-section').load(`/projects/${projectId}/initial_positions`, () => {
              $('#stop-condition-section').load(`/projects/${projectId}/stop_condition`, () => {
                document.dispatchEvent(new Event('simula:reload-vue'))
              })
            })
          })
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
          updateAgentRulesTable(data)
        }

        conflictChecker.check(data)

        console.log(`Project ${projectId}: received`, data)
      }
    })
  }

  $('#project-help-link').click(function (e) {
    showProjectHelpModal(projectId, false)
    e.preventDefault()
  })
})
