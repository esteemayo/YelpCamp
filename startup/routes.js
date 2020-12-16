const express = require('express');
const path = require('path');
const xss = require('xss-clean');
const morgan = require('morgan');
const helmet = require('helmet');
const passport = require('passport');
const flash = require('connect-flash');
const compression = require('compression');
const localStrategy = require('passport-local');
const methodOverride = require('method-override');
const mongoSanitize = require('express-mongo-sanitize');
const User = require('../models/User');

// Requiring routes
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controller/errorController');
const helpers = require('../helpers');
const commentRoutes = require('../routes/comments');
const campgroundRoutes = require('../routes/campgrounds');
const landing = require('../routes/landing');
const register = require('../routes/register');
const auth = require('../routes/auth');

module.exports = app => {
    app.set('view engine', 'ejs');

    if (app.get('env') === 'development') {
        app.use(morgan('dev'));
    }

    // Set security http headers
    if (app.get('env') === 'production') {
        app.use(helmet());
    }
    
    // Serving static files
    app.use(express.static(path.join(`${__dirname}/../public`)));

    // Body parser
    app.use(express.json({ limit: '10kb' }));
    app.use(express.urlencoded({ extended: true, limit: '10kb' }));

    // Method override
    app.use(methodOverride('_method'));

    // Data sanitization against nosql query injection
    app.use(mongoSanitize());

    // Data sanitize against xss
    app.use(xss());

    // Compression
    app.use(compression());

    // seedDB(); seed the DB
    
    // Express session
    app.use(require('express-session')({
        secret: 'I love NodeJS',
        resave: false,
        saveUninitialized: false
    }));

    // Connect flash
    app.use(flash());

    // Passport configurattion
    app.use(passport.initialize());
    app.use(passport.session());
    passport.use(new localStrategy(User.authenticate()));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.use((req, res, next) => {
        res.locals.currentUser = req.user;
        res.locals.error = req.flash('error');
        res.locals.success = req.flash('success');
        res.locals.info = req.flash('info');
        res.locals.currentPath = req.originalUrl;
        res.locals.h = helpers;
        next();
    });

    app.use('/', landing);
    app.use('/campgrounds', campgroundRoutes);
    app.use('/campgrounds/:id/comments', commentRoutes);
    app.use('/users', register);
    app.use('/auth', auth);

    app.all('*', (req, res, next) => {
        next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
    });

    app.use(globalErrorHandler);
}