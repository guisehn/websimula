import _ from 'lodash'
import Constants from '../../../constants'
import Util from '../util'

export default {
  label: 'Definir valor de variável',
  input: [
    {
      name: 'variable_id',
      type: 'variable',
      label: 'Qual variável?',
      defaultValue: null,
      required: true
    },
    {
      name: 'value',
      type: 'string',
      label: 'Valor',
      defaultValue: null,
      required: true
    }
  ],
  definition: (env, agent, input) => {
    let variable = env.variables[input.variable_id]
    variable.value = variable.definition.data_type === 'number' ? Number(input.value) : input.value
  },
  help: () =>
    `<p>Redefine o valor de uma variável para um determinado valor. Exemplos:</p>
     <ul>
       <li>Variável: <code>Valor A</code> - Valor: <code>5</code></li>
       <li>Variável: <code>Palavra</code> - Valor: <code>foo</code></li>
     </ul>
     <p>Também é possível definir valores dinâmicos, baseados em uma ou mais variáveis. Para isso, utilize os
     símbolos <code>{{</code> e <code>}}</code> para definir a área de computação, e os nomes de variáveis entre
     colchetes para acessar seus valores. Exemplos:</p>
     <ul>
       <li>Variável: <code>ABC</code> - Valor: <code>{{ [ABC] + 3 }}</code> -- irá incrementar em 3 o valor da variável <code>ABC</code></li>
       <li>Variável: <code>C</code> - Valor: <code>{{ [A] + [B] }}</code> -- faz com que o valor da variável <code>C</code> seja igual a <code>A + B</code></li>
       <li>Variável: <code>C</code> - Valor: <code>{{ [B] - [A] }}</code> -- faz com que o valor da variável <code>C</code> seja igual a <code>B - A</code></li>
       <li>Variável: <code>Nome</code> - Valor: <code>{{ [Nome 1] || "-" || [Nome 2] }}</code> -- faz com que o valor da variável <code>Nome</code> seja
       uma concatenação dos valores das variáveis <code>Nome 1</code> e <code>Nome 2</code>, com um hífen (<code>-</code>) no meio). Nesse caso,
       se <code>Nome 1</code> for <code>João</code> e <code>Nome 2</code> for <code>Maria</code>, o valor de <code>Nome</code> seria definido para
       <code>João-Maria</code></li>
     </ul>
     <p>Os operadores matemáticos permitidos são <code>+</code> (soma), <code>-</code> (subtração), <code>*</code> (multiplicação), <code>/</code> (divisão),
     <code>%</code> (resto) e <code>||</code> (concatenação para textos).</p>`
}
