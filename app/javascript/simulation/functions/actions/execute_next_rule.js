import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Executar próxima regra do agente',
  definition: (env, agent, input) => {
    env.executeNextRule()
  },
  help: () =>
    `<p>Tenta executar as próximas regras deste agente (caso as condições passem), em vez de parar
     de executar as regras.</p>`
}
