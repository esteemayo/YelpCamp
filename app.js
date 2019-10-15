require('dotenv').config();
const express = require('express');
const seedDB = require('./seeds');


const app = express();

require('./startup/routes')(app);
require('./startup/db')();

// seedDB(); seed the DB




const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`YELPCAMP SERVER LISTENING ON PORT ${PORT}`));