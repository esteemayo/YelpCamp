const mongoose = require('mongoose');


module.exports = () => {
    mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useCreateIndex: true
    })
        .then(() => console.log('MongoDB Connected.....'))
        .catch(err => console.log(`Could not connect to MongoDB: ${err}`));
}