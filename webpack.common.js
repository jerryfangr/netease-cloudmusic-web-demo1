const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// mini-css-extract-plugin: 用于将 CSS 从主应用程序中分离。

module.exports = {
  entry: {
    index: './src/index/index.js',
    admin: './src/admin/admin.js',
    player: './src/player/player.js'
  },
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    moduleIds: 'deterministic', 
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
        },
        myVendor: {
          test: /[\\/]src[\\/]vendor[\\/]/,
          name: 'vendor',
          chunks: 'all',
        }        
      }
    },
  },
  module: {
    rules: [
      // {
      //   test: /\.(png|svg|jpg|jpeg|gif)$/i,
      //   type: 'asset/resource',
      // },
      {
        test: /\.(png|jpg|gif|svg)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              // 超过2k的文件打包为为图片文件，否则base64代码显示在HTML页面
              limit: 2 * 1024,
              name: "asserts/img/[hash].[ext]",
            }
          }
        ]
      }
    ]
  },
  plugins: [
    // new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({ // Generates default index.html
      filename: 'index.html',
      template: './src/asserts/index.html',
      chunks: ['index']
    }), 
    new HtmlWebpackPlugin({  // Also generate a admin.html
      filename: 'admin.html',
      template: './src/asserts/admin.html',
      chunks: ['admin']
    }),
    new HtmlWebpackPlugin({  // Also generate a admin.html
      filename: 'player.html',
      template: './src/asserts/player.html',
      chunks: ['player']
    }),
  ],
};