require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const methodOverride = require('method-override');
const localPassportMongoose = require('passport-local-mongoose');
const Campground = require('./models/campgrounds');
const Comment = require('./models/comment');
const User = require('./models/user');
const seedDB = require('./seeds');


// REQUIRING ROUTES
const commentRoutes = require('./routes/comments');
const campgroundRoutes = require('./routes/campgrounds');
const indexRoutes = require('./routes/index');

const app = express();

mongoose.connect('mongodb://localhost:27017/yelp_camp', {
    useNewUrlParser: true
});
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
// seedDB(); seed the DB

// PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: 'I love NodeJS',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);









const port = process.env.PORT || 4000;

app.listen(port, () => {
    console.log(`YELPCAMP SERVER LISTENING ON PORT ${port}`);
});