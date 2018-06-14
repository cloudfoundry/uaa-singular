const path = require('path');

const htmlFileReader = {
  rules: [
    {
      test: /\.(html)$/,
      use: [
        {
          loader: 'file-loader',
          options: {
            name: '[name].html'
          }
        }
      ]
    }
  ]
};

module.exports = [
  {
    module: htmlFileReader,
    entry: ['idempotent-babel-polyfill', './src/singular.js'],
    output: {
      filename: 'singular.js',
      path: path.resolve(__dirname, 'singular'),
      library: 'Singular',
      libraryExport: 'default',
      libraryTarget: 'var'
    }
  },
  {
    module: htmlFileReader,
    entry: ['idempotent-babel-polyfill', './src/singular.js'],
    output: {
      filename: 'singular.umd.js',
      path: path.resolve(__dirname, 'singular'),
      library: 'Singular',
      libraryExport: 'default',
      libraryTarget: 'umd'
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
];
