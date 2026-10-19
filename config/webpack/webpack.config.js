const { generateWebpackConfig, merge } = require("shakapacker");
const { VueLoaderPlugin } = require("vue-loader");

const customConfig = {
  resolve: {
    extensions: [".vue", ".js.erb", ".erb"]
  },
  module: {
    rules: [
      {
        test: /\.vue(\.erb)?$/,
        loader: "vue-loader"
      }
    ]
  },
  plugins: [new VueLoaderPlugin()]
};

module.exports = merge(customConfig, generateWebpackConfig());
