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
//= require bootstrap-editable
//= require spectrum
//= require spectrum.pt-br
//= require_tree .

function simulaEditableOptions() {
  return {
    url: function (params) {
      var inner = {};
      inner[$(this).data('property')] = params.value;

      var data = {};
      data[$(this).data('model')] = inner;

      return $.ajax({
        type: 'PUT',
        url: $(this).data('model-url'),
        dataType: 'json',
        data: data
      });
    },

    error: function(response, newValue) {
      var message = '';
      var prop = $(this).data('property');

      if (response.responseJSON && response.responseJSON[prop]) {
        message = response.responseJSON[prop].join(', ');
      } else {
        message = 'Ocorreu um erro. Por favor, tente novamente.';
      }

      return message;
    }
  };
}
