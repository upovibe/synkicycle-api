const { createRequire } = require('module');
const path = require('path');

// Register tsconfig-paths
require('tsconfig-paths/register');

// Set up module resolution
const require = createRequire(path.resolve(__dirname, '../dist/index.js'));

// Import the built app
const app = require('../dist/app.js').default;

module.exports = app;
