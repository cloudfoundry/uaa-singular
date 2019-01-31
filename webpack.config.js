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
    mode: 'production',
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
    mode: 'production',
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
    mode: 'production',
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
