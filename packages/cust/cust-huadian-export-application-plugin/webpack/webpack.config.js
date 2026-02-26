const fs = require('fs');
const path = require('path');
const sass = require('sass');

const { VueLoaderPlugin } = require('vue-loader');

const ROOT_PATH = path.resolve(__dirname, '../');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  resolve: {
    extensions: ['.js', '.vue', 'css', 'scss'],
    alias: { '@': path.resolve(ROOT_PATH, './src') },
  },
  externals: {
    vue: 'Vue',
    'opp-vue': 'oppVue',
    'opp-core': 'oppCore',
    'opp-tools': 'oppTools',
    'element-plus': 'ElementPlus',
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        loader: 'source-map-loader',
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: true,
              name: '[path][name].[ext]',
            },
          },
        ],
      },
      {
        test: /\.css$/,
        oneOf: [
          {
            resourceQuery: /module/,
            use: [
              'style-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: '[name]__[local]--[hash:base64:5]',
                  },
                },
              },
            ],
          },
          {
            resourceQuery: /scoped/,
            use: ['style-loader', 'css-loader'],
          },
          {
            use: ['style-loader', 'css-loader'],
          },
        ],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { importLoaders: 2 },
          },
          {
            loader: 'postcss-loader',
          },
          {
            loader: 'sass-loader',
            options: { implementation: sass },
          },
        ],
      },
    ],
  },
  plugins: [new VueLoaderPlugin()],
};
