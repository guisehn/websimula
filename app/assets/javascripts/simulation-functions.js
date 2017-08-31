'use strict'

window.simulationFunctions = {
  value_comparison: {
    order: 1,
    type: 'condition',
    label: 'Comparar variável com valor',
    input: [
      {
        name: 'variable',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        nullLabel: 'Selecione a variável',
        required: true
      },
      {
        name: 'comparison',
        type: 'string',
        label: 'Comparação',
        defaultValue: '=',
        required: true,
        options: [
          { value: '=', label: 'É igual a' },
          { value: '!=', label: 'É diferente de' },
          { value: '>', label: 'É maior que' },
          { value: '>=', label: 'É maior ou igual que' },
          { value: '<', label: 'É menor que' },
          { value: '<=', label: 'É menor ou igual a' }
        ]
      },
      {
        name: 'value',
        type: 'string',
        label: 'Qual valor?',
        defaultValue: '',
        required: true
      }
    ],
    definition: (env, agent, input, output) => {
      let variable = env.variables[input.variable]

      switch (input.comparison) {
        case '=':  return variable.value == input.value
        case '!=': return variable.value != input.value
        case '>':  return variable.value > input.value
        case '>=': return variable.value >= input.value
        case '<':  return variable.value < input.value
        case '<=': return variable.value <= input.value
      }
    }
  },

  variable_comparison: {
    order: 2,
    type: 'condition',
    label: 'Comparar variável com variável',
    input: [
      {
        name: 'variable1',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        nullLabel: 'Selecione a variável',
        required: true
      },
      {
        name: 'comparison',
        type: 'string',
        label: 'Comparação',
        defaultValue: '=',
        required: true,
        options: [
          { value: '=', label: 'É igual a' },
          { value: '!=', label: 'É diferente de' },
          { value: '>', label: 'É maior que' },
          { value: '>=', label: 'É maior ou igual que' },
          { value: '<', label: 'É menor que' },
          { value: '<=', label: 'É menor ou igual a' }
        ]
      },
      {
        name: 'variable2',
        type: 'variable',
        label: 'Qual variável?',
        defaultValue: null,
        nullLabel: 'Selecione a variável',
        required: true
      },
    ],
    definition: (env, agent, input, output) => {
      let variable1 = env.variables[input.variable1]
      let variable2 = env.variables[input.variable2]

      switch (input.comparison) {
        case '=':  return variable1.value == variable2.value
        case '!=': return variable1.value != variable2.value
        case '>':  return variable1.value > variable2.value
        case '>=': return variable1.value >= variable2.value
        case '<':  return variable1.value < variable2.value
        case '<=': return variable1.value <= variable2.value
      }
    }
  },

  perceive_agent: {
    order: 3,
    type: 'condition',
    label: 'Perceber agente',
    input: [
      {
        name: 'agent',
        type: 'agent',
        label: 'Qual agente?',
        defaultValue: null,
        nullLabel: 'Qualquer agente',
        required: false
      }
    ],
    output: [
      {
        name: 'perceived_agent',
        label: 'Agente percebido',
        type: 'agent'
      }
    ],
    definition: (env, agent, input, output) => {
      return false
    }
  }
}
