window.simulaEditableOptions = () => {
  return {
    url (params) {
      var inner = {}
      inner[$(this).data('property')] = params.value

      var data = {}
      data[$(this).data('model')] = inner

      return $.ajax({
        type: 'PUT',
        url: $(this).data('model-url'),
        dataType: 'json',
        data: data
      })
    },

    error (response, newValue) {
      var message = ''
      var prop = $(this).data('property')

      if (response.responseJSON && response.responseJSON[prop]) {
        message = response.responseJSON[prop][0]
      } else {
        message = 'Ocorreu um erro. Por favor, tente novamente.'
      }

      return message
    }
  }
}
