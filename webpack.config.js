const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

const devMode = process.env.NODE_ENV === 'development';

module.exports = {
  performance: {
    hints: false,
  },
  optimization: {
    minimizer: [
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          safe: true,
        },
      }),
      new TerserPlugin(),
    ],
  },
  entry: './src/client/main.tsx',
  output: {
    path: __dirname + '/dist/client',
    filename: 'main.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.scss$/i,
        use: [
          { loader: MiniCssExtractPlugin.loader, options: { hmr: devMode } },
          {
            loader: 'css-loader',
            options: {
              importLoaders: 2,
            },
          },
          'sass-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  mode: devMode ? 'development' : 'production',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: './src/client/index.html', to: './index.html' }],
    }),
    new MiniCssExtractPlugin({
      allChunks: true,
    }),
  ],
};
