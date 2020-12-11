const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Models
const Campground = require('../../models/Campground');
const Comment = require('../../models/Comment');
const User = require('../../models/User');

dotenv.config({ path: './variable.env' });

// Db local
const dbLocal = process.env.MONGODB_URI;

// MongoDB Connection
mongoose.connect(dbLocal, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})
    .then(() => console.log(`Mongodb Connected → ${dbLocal}`));

// Read JSON file
const campgrounds = JSON.parse(fs.readFileSync(`${__dirname}/campgrounds.json`, 'utf-8'));
const comments = JSON.parse(fs.readFileSync(`${__dirname}/comments.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));

// Import data into db
const importData = async () => {
    try {
        await Campground.create(campgrounds);
        await Comment.create(comments);
        await User.create(users);

        console.log('Data successfully loaded!💯✌👍👍👍👍👍👍👍👍💯✌');
    } catch (err) {
        console.log('👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
        console.log(err);
    }
    process.exit();
};

// Delete all data from db
const deleteData = async () => {
    try {
        console.log('😢😢 Goodbye Data...');

        await Campground.deleteMany();
        await Comment.deleteMany();
        await User.deleteMany();

        console.log('Data successfully deleted! 😭😂😭');
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