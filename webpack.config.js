const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/client/main.tsx',
  output: {
    filename: 'client/main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  mode: 'production',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: './src/client/index.html', to: './client/index.html' }],
    }),
  ],
};
