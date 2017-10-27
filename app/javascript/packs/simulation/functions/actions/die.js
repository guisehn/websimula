import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Morrer',
  input: [],
  definition: (env, agent, input) => {
    env.killAgent(agent)
  },
  help: () =>
    `<p>Faz com que o agente atual seja removido do ambiente.</p>`
}
