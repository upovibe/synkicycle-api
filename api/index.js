/* eslint-disable */
const path = require('path');

// Register tsconfig paths with explicit baseUrl
require('tsconfig-paths').register({
  baseUrl: path.join(__dirname, '..', 'dist'),
  paths: {
    '@config/*': ['config/*'],
    '@controllers/*': ['controllers/*'],
    '@middleware/*': ['middleware/*'],
    '@models/*': ['models/*'],
    '@routes/*': ['routes/*'],
    '@types/*': ['types/*'],
    '@utils/*': ['utils/*']
  }
});

const app = require('../dist/app.js').default;

module.exports = app;

