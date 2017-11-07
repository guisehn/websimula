import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Deixar pista',
  input: [],
  definition: (env, agent, input) => {
    env.buildClue(agent.position.x, agent.position.y)
  },
  help: () =>
    `<p>Deixa uma pista na posição atual do agente. Esta pista pode percebida por outros agentes
      ou por ele mesmo.</p>`
}
