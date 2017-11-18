export default {
  STAGE_SIZE: 25, // amount of positions for row/column
  AGENT_SIZE: 16, // square, in pixels
  DEFAULT_SPEED: 200, // initial simulation speed, in miliseconds,
  DISABLE_TRANSITION_THRESHOLD: 45, // disable agent transition if speed is under this value,

  COMPARISON_OPTIONS: [
    { value: '=', label: 'É igual a' },
    { value: '!=', label: 'É diferente de' },
    { value: '>', label: 'É maior que' },
    { value: '>=', label: 'É maior ou igual que' },
    { value: '<', label: 'É menor que' },
    { value: '<=', label: 'É menor ou igual a' }
  ],

  DIRECTION_OPTIONS: [
    { value: 'N', label: 'Norte' },
    { value: 'S', label: 'Sul' },
    { value: 'E', label: 'Leste' },
    { value: 'W', label: 'Oeste' },
    { value: 'NE', label: 'Nordeste' },
    { value: 'NW', label: 'Noroeste' },
    { value: 'SE', label: 'Sudeste' },
    { value: 'SW', label: 'Sudoeste' }
  ]
}
