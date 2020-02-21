const path                      = require('path');
const ManifestPlugin            = require("webpack-manifest-plugin");    // 导出webpack依赖图
const { CleanWebpackPlugin }    = require("clean-webpack-plugin");       // 清除dist目录
const MiniCssExtractPlugin      = require("mini-css-extract-plugin");    // js中包含css创建单独文件
const CompressionPlugin         = require("compression-webpack-plugin"); // 资源压缩
const UglifyPlugin              = require("uglifyjs-webpack-plugin");    // uglifyjs
const autoprefixer              = require("autoprefixer");               // css自动增加前缀根据Can i use
const CopyPlugin                = require("copy-webpack-plugin");


module.exports = {
  name: 'client',
  entry: './src/client.js',
  watchOptions: {
    ignored: ['codes'],
  },
  output: {
    path: path.resolve(__dirname, 'dist/public'),
    publicPath: '/static/',
    filename: 'bundle.[hash:6].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader'
        },
        exclude: /node_modules/
      },
      {
        test: /\.(css|scss)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [autoprefixer()]
            }
          },
          {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 4096,
              name: '[name].[hash:6].[ext]',
              outputPath: 'images/'
            }
          }
        ]
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-url-loader',
          options: {
            noquotes: true,
            limit: 4096,
            name: '[name].[hash:6].[ext]',
            outputPath: 'images/'
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin([{ from: "src/assets/favicons", to: "favicons" }]),
    new ManifestPlugin(),
    new MiniCssExtractPlugin(),
    new CompressionPlugin(),
    new UglifyPlugin({
      uglifyOptions: {
        output: {
          comments: false
        },
        compress: {
          drop_console: true
        }
      }
    }),
  ],
  resolve: {
    alias: {
      app: path.resolve(__dirname, 'src/app')
    },
    extensions: ['.js', '.jsx']
  }
}
