const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
require('colors');

// models
const User = require('../../models/User');
const Comment = require('../../models/Comment');
const Campground = require('../../models/Campground');

dotenv.config({ path: './variable.env' });

// db local
const dbLocal = process.env.MONGODB_URI;

// MongoDB connection
mongoose
  .connect(dbLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log(`Mongodb Connected → ${dbLocal}`.gray.bold));

// read JSON file
const campgrounds = JSON.parse(
  fs.readFileSync(`${__dirname}/campgrounds.json`, 'utf-8')
);
const comments = JSON.parse(
  fs.readFileSync(`${__dirname}/comments.json`, 'utf-8')
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// import data into db
const importData = async () => {
  try {
    await User.create(users);
    await Comment.create(comments);
    await Campground.create(campgrounds);

    console.log('Data successfully loaded!💯✌👍👍👍👍👍👍👍👍💯✌'.green.bold);
  } catch (err) {
    console.log(
      '👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n'
        .red.bold
    );
    console.log(err);
  }
  process.exit();
};

// delete all data from db
const deleteData = async () => {
  try {
    console.log('😢😢 Goodbye Data...'.green.bold);

    await User.deleteMany();
    await Comment.deleteMany();
    await Campground.deleteMany();

    console.log('Data successfully deleted! 😭😂😭'.green.bold);
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv.includes('--import')) {
  importData();
} else if (process.argv.includes('--delete')) {
  deleteData();
}
