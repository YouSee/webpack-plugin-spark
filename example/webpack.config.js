const path = require('path')
const WebpackPluginSpark = require('webpack-plugin-spark')

module.exports = {
  entry: './src/index.js',
  plugins: [
    new WebpackPluginSpark({
      progress: true,
      liveReload: true,
      static: path.resolve(__dirname, 'dist'),
      port: 3000,
    }),
  ],
  watch: true,
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}
