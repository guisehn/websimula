import Rails from '@rails/ujs'
import { start as startActiveStorage } from '@rails/activestorage'
import Turbolinks from 'turbolinks'
import './channels'

Rails.start()
startActiveStorage()
Turbolinks.start()
