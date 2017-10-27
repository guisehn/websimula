import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Reproduzir agente',
  input: [
    {
      name: 'agent_id',
      type: 'agent',
      label: 'Agente',
      defaultValue: null,
      required: true
    },
    {
      name: 'quantity',
      type: 'number',
      label: 'Quantidade',
      defaultValue: 1,
      required: true
    },
    {
      name: 'execute_rules_immediately',
      type: 'boolean',
      label: 'Executar regras imediatamente',
      defaultValue: false
    }
  ],
  definition: (env, agent, input) => {
    let agentDefinition = _.find(env.definition.agents, { id: input.agent_id })
    let quantityCreated = 0

    Util.getAdjacentCoordinates(env, agent.position.x, agent.position.y, env.stageSize, true, (x, y) => {
      if (quantityCreated >= input.quantity) {
        return false
      }

      if (!Util.isCoordinateOccupied(env, x, y)) {
        let agent = env.buildAgent(agentDefinition, x, y, 0, true)

        if (input.execute_rules_immediately) {
          env.executeAgentRules(agent)
        }

        quantityCreated++
      }
    })
  },
  help: () =>
    `<p>Cria um ou mais novos agentes de determinado tipo no ambiente, de acordo com a quantidade e tipo
     especificados. Os novos agentes serão criados nas coordenadas que cercam o agente atual, se disponíveis.
     Caso estejam ocupadas, os agentes filhos serão criados em coordenadas mais distantes, se possível.
     </p>
     <p>Caso a opção "Executar regras imediatamente" esteja marcada, o ambiente irá executar as regras de
     comportamento desse agente imediatamente após ele ser adicionado no ambiente. Caso não esteja
     marcada, as regras serão executadas apenas no próximo ciclo de simulação.</p>`
}
