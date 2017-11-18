import _ from 'lodash'

import Constants from './constants'
import eyedropperToolImage from './images/eyedropper-icon.png'

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

function activateGrid(imageEditor, grid, colorPickerInput, dataUrlInput) {
  let painting = false

  for (let i = 0; i < Constants.AGENT_SIZE; i++) {
    let row = $('<tr></tr>').appendTo(grid)

    for (let j = 0; j < Constants.AGENT_SIZE; j++) {
      $('<td></td>').data('color', 'rgba(0,0,0,0)').appendTo(row)
    }
  }

  grid.on('dragstart', e => e.preventDefault())

  grid.on('mousedown', () => {
    $('body').on('selectstart.image-editor-disable-selection', e => e.preventDefault())
    painting = true
  })

  grid.on('mouseup', e => {
    $('body').off('.image-editor-disable-selection')

    if (painting && imageEditor.data('isEyedropperToolSelected')) {
      toggleEyedropperTool(imageEditor, false)
    }

    painting = false
  })

  grid.on('mousedown mouseover', 'td', function (e) {
    // `mouseup` will normally be called when the user releases
    // the button and take care of this automatically, but there's
    // an edge case where the user may release the button while the
    // cursor is out of the image editor. in this case, when the cursor
    // goes back to the editor, we need to make sure we stop the painting
    if (e.which === 0) {
      grid.trigger('mouseup')
      return
    }

    if (e.type === 'mousedown' || painting) {
      if (imageEditor.data('isEyedropperToolSelected')) {
        colorPickerInput.spectrum('set', $(this).data('color'))
      } else {
        let color = colorPickerInput.spectrum('get')
        color = color ? color.toRgb() : { r: 0, g: 0, b: 0, a: 0 }

        let changed = setColor($(this), color)

        if (changed) {
          refreshInputValue(dataUrlInput, grid)
        }
      }
    }
  })
}

function activateColorPicker(imageEditor, input) {
  input.spectrum({
    allowEmpty: true,
    color: '#000',
    preferredFormat: 'rgb',
    showButtons: false,
    showInput: true,
    show: () => toggleEyedropperTool(imageEditor, false)
  })
}

function toggleEyedropperTool(imageEditor, selected) {
  if (_.isNil(selected)) {
    selected = !imageEditor.data('isEyedropperToolSelected')
  }

  imageEditor.data('isEyedropperToolSelected', selected)
  imageEditor.toggleClass('.eyedropper-selected', selected)
  imageEditor.find('.btn-eyedropper').toggleClass('active', selected)
}

function activateEyedropperTool(imageEditor) {
  imageEditor.data('isEyedropperToolSelected', false)

  imageEditor.find('.btn-eyedropper').on('click', e => {
    toggleEyedropperTool(imageEditor)
    e.preventDefault()
  })
}

function activateImageFileInput(fileInput, dataUrlInput, grid) {
  fileInput.change(function (e) {
    let file = e.originalEvent.target.files[0]

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

    // ensure that the input value is updated after the canvas is drawn
    // we need to make sure that the uploaded image is resized if the user
    // uses the file input
    refreshInputValue(dataUrlInput, grid)
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
          <label>Selecionar cor:</label>
          <input type="hidden">

          <span class="or">ou</span>

          <a href="" class="btn-eyedropper btn btn-default" title="Ferramenta conta-gotas">
            <img src="${eyedropperToolImage}" alt="">
          </a>
        </div>
        <div class="file-selector-container">
          <label for="image-editor-file-upload">Enviar imagem:</label>
          <input type="file" accept="image/*" id="image-editor-file-upload">
          <span class="hint">
            Tamanho de imagem ideal: ${Constants.AGENT_SIZE}x${Constants.AGENT_SIZE} pixels.<br>
            Imagens maiores serão redimensionadas<br>
            para este tamanho.
          </span>
        </div>
      </div>
    `)

    let dataUrlInput = options.input
    let grid = imageEditor.find('.image-editor-grid')
    let colorPickerInput = imageEditor.find('.color-picker-container input')
    let imageFileInput = imageEditor.find('.file-selector-container input')

    activateGrid(imageEditor, grid, colorPickerInput, dataUrlInput)
    activateColorPicker(imageEditor, colorPickerInput)
    activateEyedropperTool(imageEditor)
    activateImageFileInput(imageFileInput, dataUrlInput, grid)
    refreshGridFromDataUrlInput(grid, dataUrlInput)
  })
}
