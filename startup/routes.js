const express = require('express');
const path = require('path');
const xss = require('xss-clean');
const flash = require('connect-flash');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const localStrategy = require('passport-local');
const compression = require('compression');
const passport = require('passport');
const methodOverride = require('method-override');
const { StatusCodes } = require('http-status-codes');

// requiring routes
const User = require('../models/User');
const AppError = require('../utils/appError');
const globalErrorHandler = require('../controller/errorController');
const helpers = require('../helpers');
const commentRoutes = require('../routes/comments');
const campgroundRoutes = require('../routes/campgrounds');
const landing = require('../routes/landing');
const register = require('../routes/register');
const auth = require('../routes/auth');

module.exports = (app) => {
  app.set('view engine', 'ejs');

  if (app.get('env') === 'development') {
    app.use(morgan('dev'));
  }

  // set security http headers
  if (app.get('env') === 'production') {
    app.use(helmet());
  }

  // serving static files
  app.use(express.static(path.join(`${__dirname}/../public`)));

  // body parser
  app.use(express.json({ limit: '10kb' }));
  app.use(express.urlencoded({ extended: true, limit: '10kb' }));

  // method override
  app.use(methodOverride('_method'));

  // data sanitization against nosql query injection
  app.use(mongoSanitize());

  // data sanitize against xss
  app.use(xss());

  // compression
  app.use(compression());

  // seedDB(); seed the DB

  // express session
  app.use(
    require('express-session')({
      secret: 'I love NodeJS',
      resave: false,
      saveUninitialized: false,
    })
  );

  // connect flash
  app.use(flash());

  // passport configurattion
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new localStrategy(User.authenticate()));
  passport.serializeUser(User.serializeUser());
  passport.deserializeUser(User.deserializeUser());

  app.use(async (req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    res.locals.info = req.flash('info');
    res.locals.currentPath = req.originalUrl;
    res.locals.h = helpers;
    next();
  });

  // routes middleware
  app.use('/', landing);
  app.use('/campgrounds', campgroundRoutes);
  app.use('/campgrounds/:id/comments', commentRoutes);
  app.use('/users', register);
  app.use('/auth', auth);

  app.all('*', (req, res, next) => {
    next(
      new AppError(
        `Can't find ${req.originalUrl} on this server.`,
        StatusCodes.NOT_FOUND
      )
    );
  });

  app.use(globalErrorHandler);
};
