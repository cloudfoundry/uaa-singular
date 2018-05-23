const path = require('path');

mode = 'none'

var htmlFileReader =  {
  rules: [
    {
      test: /\.(html)$/,
      use: [
        {
          loader: 'file-loader',
          options: {}
        }
      ]
    }
  ]
}

module.exports = [
  {
    module: htmlFileReader,
    entry:
      ['idempotent-babel-polyfill', './src/singular.js'],
    output: {
      filename: 'singular.js',
      path: path.resolve(__dirname, 'singular'),
      library: 'Singular',
      libraryExport: 'default'
    }
  },
  {
    module: htmlFileReader,
    entry: ['idempotent-babel-polyfill', './src/rpFrame.js'],
    output: {
      filename: 'rpFrame.js',
      path: path.resolve(__dirname, 'singular'),
      library: 'RPFrame',
      libraryExport: 'default'
    }
  }
]
