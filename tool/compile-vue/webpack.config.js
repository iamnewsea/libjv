/**
 * webpack.config.js
 * 
 * @author  Yang,junlong at 2018-09-10 16:20:52 build.
 * @version $Id$
 */

const path = require('path');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

module.exports = {
  entry: './src/hello.vue',
  output: {
    filename: 'hello.js',
    path: path.resolve(__dirname, './dist'),
    library: 'hello',
    //libraryTarget: 'umd'
  },
  mode: 'production',
  devtool: 'none',
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.css$/,
        use: [ 'vue-style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        loader: 'babel-loader'
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader',
          'sass-loader',
        ]
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin()
  ]
}