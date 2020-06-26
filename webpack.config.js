'use strict';
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
};
