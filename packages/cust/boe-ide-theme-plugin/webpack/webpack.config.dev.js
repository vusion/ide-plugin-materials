const path = require('path');
const { merge } = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');

const base = require('./webpack.config.js');
const { name } = require('../package.json');

const ROOT_PATH = path.resolve(__dirname, '../');

const more = {
  devServer: {
    open: true,
    server: 'https',
    host: '0.0.0.0',
    port: '1613',
    webSocketServer: false,
    historyApiFallback: true,
    client: { overlay: false },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
  },
  entry: {
    index: './src/index.js',
    readme: './doc/readme.js',
  },
  output: {
    library: name,
    libraryTarget: 'window',
    filename: '[name].js',
    path: path.resolve(ROOT_PATH, './dist'),
  },
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',
          'markdown-loader',
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'boe-ide-theme-plugin',
      chunks: ['readme'],
    }),
  ],
};

module.exports = merge(base, more);
