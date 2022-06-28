const mongoose = require('mongoose');
require('colors');

const db = process.env.MONGODB_URI;

module.exports = () => {
  mongoose
    .connect(db, {
      useNewUrlParser: true,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => console.log(`MongoDB Connected → ${db}`.gray.bold));
};
