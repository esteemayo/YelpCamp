const dotenv = require('dotenv');

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION!💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: './variable.env' });
const app = require('./app');

// MongoDB connection
require('./startup/db')();

app.set('port', process.env.PORT || 4000);

const server = app.listen(app.get('port'), () => console.log(`YELPCAMP SERVER LISTENING ON PORT ${server.address().port}`));

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION!💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});