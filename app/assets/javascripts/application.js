// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file. JavaScript code in this file should be added after the last require_* statement.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require turbolinks
//= require bootstrap-sprockets
//= require spectrum
//= require spectrum.pt-br
//= require lodash
//= require_tree .

var currentProjectId = null

$(document).on('turbolinks:load', function () {
  var projectId = window.location.pathname.match(/^\/projects\/([0-9])+/)
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
        if (data.model === 'Agent') {
          $('#agents-section').load(`/projects/${projectId}/agents`);
        }

        if (data.model === 'Variable') {
          $('#variables-section').load(`/projects/${projectId}/variables`);
        }

        console.log(`Project ${projectId}: received`, data)
      }
    })
  }
})
