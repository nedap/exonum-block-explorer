const path = require('path');

const build = `${__dirname}${path.sep}build`;

// the clean options to use
let cleanOptions = {
  verbose:  true,
  dry:      false
}

module.exports = {
  entry: {
    app: './src/index.ts'
  },
  output: {
    path: build,
    filename: 'index.js'
  },
  resolve: {
    extensions: [".ts", ".js", ".vue"],
    alias: {
      vue: 'vue/dist/vue.js',
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: 'html-loader'
      },
      {
        test: /\.ts$/,
        enforce: 'pre',
        loader: 'tslint-loader',
        options: {
          configFile: './tslint.json',
          failOnHint: false,
          typeCheck: true,
          tsConfigFile: './tsconfig.json',
        }
      },
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/]
        }
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
            esModule: true
        }
      },
      {
        test: /\.css$/,
        loader: 'css-loader'
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
            name: './img/[hash].[ext]'
        }
      }
    ]
  },
};