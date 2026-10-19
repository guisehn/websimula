module.exports = function (api) {
  const currentEnv = api.env()
  const validEnv = ['development', 'test', 'production']

  if (!validEnv.includes(currentEnv)) {
    throw new Error(
      'Please specify a valid `NODE_ENV` or ' +
        '`BABEL_ENV` environment variables. Valid values are "development", ' +
        '"test", and "production". Instead, received: ' +
        JSON.stringify(currentEnv) +
        '.'
    )
  }

  api.cache.using(() => currentEnv)

  return {
    presets: [
      [
        '@babel/preset-env',
        currentEnv === 'test'
          ? { targets: { node: 'current' } }
          : {
              forceAllTransforms: true,
              modules: false,
              exclude: ['transform-typeof-symbol']
            }
      ]
    ]
  }
}
