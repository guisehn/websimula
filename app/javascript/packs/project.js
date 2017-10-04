import _ from 'lodash'

let currentProjectId = null

$(document).on('turbolinks:load', function () {
  let projectId = window.location.pathname.match(/^\/projects\/([0-9])+/)
  projectId = projectId ? projectId[1] : null

  function updateBindings(modelName, model) {
    _.forEach(model, (value, key) => {
      // skip keys starting with _
      if (key[0] === '_') return;

      $(`[data-bind=${modelName}-${key}]`).each(function () {
        let label = model[`_${key}_label`] ? model[`_${key}_label`] : value

        if ($(this).text() !== label) {
          $(this).text(label).hide().fadeIn(500)
        }

        if ($(this).data('editable')) {
          $(this).editable('setValue', value)
        }
      })
    })
  }

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
        }

        if (data.model === 'Agent') {
          $('#agents-section').load(`/projects/${projectId}/agents`, () => {
            $('#agents-section').hide().fadeIn(500)
          })
        }

        if (data.model === 'letiable') {
          $('#letiables-section').load(`/projects/${projectId}/letiables`, () => {
            $('#letiables-section').hide().fadeIn(500)
          })
        }

        console.log(`Project ${projectId}: received`, data)
      }
    })
  }
})
