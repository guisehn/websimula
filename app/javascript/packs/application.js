/* eslint no-console:0 */

// This file is automatically compiled by Webpack, along with any other files
// present in this directory. You're encouraged to place your actual application logic in
// a relevant structure within app/javascript and only use these pack files to reference
// that code so it'll be compiled.
//
// To reference this file, add <%= javascript_pack_tag 'application' %> to the appropriate
// layout file, like app/views/layouts/application.html.erb

// Load rails client-side libraries
import '../rails'

// This module manages the project dashboard and the internal project pages, keeping track
// of the real time updates made by other users
import '../project'

// Image editor plugin (used to draw the agent images)
import '../image-editor'

// Simulator code
import '../simulation/simulator'

// Manages the load of vue.js components
import '../vue'

// Defines some global helper functions that are used on pages that have some inline javascript
// such as the project settings page, edit initial positions page, etc.
import '../global-helpers'
