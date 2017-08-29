const path = require('path');

module.exports = {
  entry: path.resolve(__dirname + '/../src/dashboard.js'),
  output: {
    path: path.resolve(__dirname + '/../dist/'),
    filename: 'dashboard.js',
    libraryTarget: 'umd',
    library: 'Dashboard'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: path.resolve(__dirname + '/src'),
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ]
  }
};
