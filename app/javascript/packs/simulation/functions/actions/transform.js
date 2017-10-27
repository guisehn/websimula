import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Transformar',
  input: [
    {
      name: 'agent_id',
      type: 'agent',
      label: 'Em qual agente?',
      defaultValue: null,
      required: true
    },
    {
      name: 'keep_age',
      type: 'boolean',
      label: 'Manter idade',
      defaultValue: true,
      required: true
    }
  ],
  definition: (env, agent, input) => {
    let agentDefinition = _.find(env.definition.agents, { id: input.agent_id })

    agent.definition = agentDefinition
    agent.age = input.keep_age ? agent.age : 0

    env.renderAgent(agent, true)
  },
  help: () =>
    `<p>Faz com que o agente atual seja transformado em outro tipo de agente. Caso a opção "Manter idade"
     não seja marcada, o agente terá a sua idade (em ciclos) redefinida para <code>0</code>.</p>`
}
