const express = require('express');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local');
const methodOverride = require('method-override');
const User = require('../models/User');

// REQUIRING ROUTES
const commentRoutes = require('../routes/comments');
const campgroundRoutes = require('../routes/campgrounds');
const landing = require('../routes/landing');
const forgot = require('../routes/forgot');
const reset = require('../routes/reset');
const register = require('../routes/register');
const auth = require('../routes/auth');
const logout = require('../routes/logout');
const users = require('../routes/users');

module.exports = app => {
    app.use(bodyParser.urlencoded({ extended: true }));
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

    app.use('/', landing);
    app.use('/campgrounds', campgroundRoutes);
    app.use('/campgrounds/:id/comments', commentRoutes);
    app.use('/users/register', register);
    app.use('/auth/login', auth);
    app.use('/auth/logout', logout);
    app.use('/users/:id', users);
    app.use('/forgot', forgot);
    app.use('/reset/:token', reset);
}