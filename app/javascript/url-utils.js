import _ from 'lodash'

const PARAM_REGEX = /\:([^:&?\/]+)/g

// Example:
// match('/projects/5/agents/9', '/projects/:projectId/agents/:agentId')
// returns { projectId: 5, agentId: 9 }
// it is flexible enough to accept slashes after the URL and query string parameter, e.g.
// match('/projects/5/agents/9///?x=y', '/projects/:projectId/agents/:agentId') returns the same value
function match(url, pattern) {
  let paramNames = (pattern.match(PARAM_REGEX) || []).map(p => p.replace(':', ''))

  let regex = _.escapeRegExp(pattern).replace(PARAM_REGEX, '([^&?\\/]+)')
  regex = '^' + regex + '(?:\/*)(?:[?&#].*)?$'

  let matches = url.toString().match(regex)
  return matches ? _.zipObject(paramNames, matches.slice(1)) : null
}

// Example:
// generate('/projects/:projectId/agents/:agentId', { projectId: 5, agentId: 9 })
// returns '/projects/5/agents/9'
function generate(url, params) {
  _.forEach(params, (value, key) => {
    let escapedKey = _.escapeRegExp(key)
    let regex = new RegExp(`:${escapedKey}`, 'g')
    url = url.replace(regex, value)
  })

  return url
}

export default { match, generate }
