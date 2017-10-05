import _ from 'lodash'

let currentProjectId = null

$(document).on('turbolinks:load', function () {
  let projectId = window.location.pathname.match(/^\/projects\/([0-9])+/)
  projectId = projectId ? projectId[1] : null

  function updateBindings(modelName, model) {
    _.forEach(model, (value, key) => {
      // skip keys starting with _
      if (key[0] === '_') return;

      let selector = `[data-bind=${modelName}-${key.replace(/_/g, '-')}][data-model-id=${model.id}]`

      $(selector).each(function () {
        let label = model[`_${key}_label`] ? model[`_${key}_label`] : value
        let bindAttribute = $(this).data('bind-attribute')
        let currentValue = bindAttribute ? $(this).attr(bindAttribute) : $(this).text();

        if (currentValue !== String(label)) {
          if (bindAttribute) {
            $(this).attr(bindAttribute, label)
          } else {
            $(this).text(label)
          }

          $(this).hide().fadeIn(500)
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
          $('#agents-section').load(`/projects/${projectId}/agents`)

          $.get(`/projects/${projectId}/agents/${data.id}.json`, agent => {
            updateBindings('agent', agent)
          })
        }

        if (data.model === 'Variable') {
          $('#variables-section').load(`/projects/${projectId}/variables`)
        }

        console.log(`Project ${projectId}: received`, data)
      }
    })
  }
})
