  
const path = require('path')

module.exports = {
  mode: 'production',
  entry: {
    app: './js/Explora/main.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'app.explora.js'
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ["@babel/preset-env"]
        }
      }
    ]
  }
}