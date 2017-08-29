const baseConfig = require('./webpack.config');

const webpack = require('webpack');
const path = require('path');
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = Object.assign(baseConfig, {
  entry: path.resolve(__dirname + '/../src/demo/demo.js'),
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname + '/../src/demo/index.html'),
      inject: true
    }),
    new FriendlyErrorsPlugin()
  ],
});
