import Constants from './constants'

function refreshInputValue(input, grid) {
  let canvas = $('<canvas></canvas>').attr('width', Constants.AGENT_SIZE).attr('height', Constants.AGENT_SIZE)
    .attr('style', 'border:1px solid red')
  let context = canvas[0].getContext('2d')

  grid.find('tr').each(function (y) {
    $(this).find('td').each(function (x) {
      context.fillStyle = $(this).data('color')
      context.fillRect(x, y, 1, 1)
    })
  })

  let url = canvas[0].toDataURL('image/png')
  input.val(url)
}

function setColor(cell, color) {
  let previousColor = cell.data('color')
  let rgba = `rgba(${color.r},${color.g},${color.b},${color.a})`

  cell.css('background-color', rgba).data('color', rgba)

  return previousColor !== rgba
}

function activateGrid(grid, colorPickerInput, dataUrlInput) {
  let painting = false

  for (let i = 0; i < Constants.AGENT_SIZE; i++) {
    let row = $('<tr></tr>').appendTo(grid)

    for (let j = 0; j < Constants.AGENT_SIZE; j++) {
      $('<td></td>').data('color', 'rgba(0,0,0,0)').appendTo(row)
    }
  }

  grid.on('mousedown', () => { painting = true })
  grid.on('mouseup mouseleave', () => { painting = false })

  grid.on('mousedown mouseover', 'td', function (e) {
    if (e.type === 'mousedown' || painting) {
      let color = colorPickerInput.spectrum('get')
      color = color ? color.toRgb() : { r: 0, g: 0, b: 0, a: 0 }

      let changed = setColor($(this), color)

      if (changed) {
        refreshInputValue(dataUrlInput, grid)
      }
    }
  })
}

function activateColorPicker(input) {
  input.spectrum({
    allowEmpty: true,
    color: '#000',
    preferredFormat: 'rgb',
    showButtons: false,
    showInput: true
  })
}

function activateImageFileInput(fileInput, dataUrlInput, grid) {
  fileInput.change(function (e) {
    let file = e.originalEvent.srcElement.files[0]

    if (file) {
      let reader = new FileReader()

      reader.onloadend = () => {
        dataUrlInput.val(reader.result)
        refreshGridFromDataUrlInput(grid, dataUrlInput)
        fileInput.val('')
      }

      reader.readAsDataURL(file)
    }
  })
}

function refreshGridFromDataUrlInput(grid, dataUrlInput) {
  let dataUrl = dataUrlInput.val()

  let canvas = $('<canvas></canvas>').attr('width', Constants.AGENT_SIZE).attr('height', Constants.AGENT_SIZE)
  let context = canvas[0].getContext('2d')

  function drawToGrid() {
    let imageData = context.getImageData(0, 0, Constants.AGENT_SIZE, Constants.AGENT_SIZE)
    let pixels = imageData.data

    for (var i = 0, n = 0, j = pixels.length; i < j; i += 4, n++) {
      let r = pixels[i]
      let g = pixels[i + 1]
      let b = pixels[i + 2]
      let a = pixels[i + 3]
      let rgba = `rgba(${r},${g},${b},${a})`

      let tr = grid.find('tr').eq(Math.floor(n / Constants.AGENT_SIZE))
      tr.find('td').eq(n % Constants.AGENT_SIZE).data('color', rgba).css('background-color', rgba)
    }
  }

  if (dataUrl) {
    let img = new Image
    img.src = dataUrlInput.val()
    img.onload = () => {
      context.drawImage(img, 0, 0, Constants.AGENT_SIZE, Constants.AGENT_SIZE)
      drawToGrid()
    }
  } else {
    drawToGrid()
  }
}

$.fn.imageEditor = function (options) {
  this.each(function () {
    let imageEditor = $('<div class="image-editor clearfix"></div>').appendTo(this)

    imageEditor.append(`
      <table class="image-editor-grid"></table>
      <div class="right-pane">
        <div class="color-picker-container">
          Selecionar cor:<br>
          <input type="hidden">
        </div>
        <div class="file-selector-container">
          Enviar imagem:<br>
          <input type="file">
        </div>
      </div>
    `)

    let dataUrlInput = options.input
    let grid = imageEditor.find('.image-editor-grid')
    let colorPickerInput = imageEditor.find('.color-picker-container input')
    let imageFileInput = imageEditor.find('.file-selector-container input')

    activateGrid(grid, colorPickerInput, dataUrlInput)
    activateColorPicker(colorPickerInput)
    activateImageFileInput(imageFileInput, dataUrlInput, grid)
    refreshGridFromDataUrlInput(grid, dataUrlInput)
  })
}
