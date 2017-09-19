
let currentProjectId = null

$(document).on('turbolinks:load', function () {
  let projectId = window.location.pathname.match(/^\/projects\/([0-9])+/)
  projectId = projectId ? projectId[1] : null

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
            $('#project-name').text(project.name).hide().fadeIn(500)

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
