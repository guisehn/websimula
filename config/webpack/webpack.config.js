const { generateWebpackConfig, merge } = require('shakapacker')
const { VueLoaderPlugin } = require('vue-loader')

// Shakapacker already runs rails-erb-loader on .erb files when that package is
// installed. A second copy evaluates the escaped lodash tags as Ruby.
const customConfig = {
  resolve: {
    extensions: ['.vue', '.js.erb', '.erb']
  },
  module: {
    rules: [
      {
        test: /\.vue(\.erb)?$/,
        loader: 'vue-loader'
      }
    ]
  },
  plugins: [new VueLoaderPlugin()]
}

module.exports = merge(customConfig, generateWebpackConfig())
