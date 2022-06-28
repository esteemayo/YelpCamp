const dotenv = require('dotenv');
require('colors');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION!💥 Shutting down...'.red.bold);
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './variable.env' });
const app = require('./app');

// MongoDB connection
require('./startup/db')();

app.set('port', process.env.PORT || 4000);

const server = app.listen(app.get('port'), () =>
  console.log(
    `YelpCamp server listening on port → ${server.address().port}`.blue.bold
  )
);

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION!💥 Shutting down...'.red.bold);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
