const express = require('express');
const seedDB = require('./seeds');

const app = express();

require('./startup/routes')(app);
// seedDB(); seed the DB

module.exports = app;
