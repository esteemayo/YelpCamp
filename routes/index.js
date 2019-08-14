const express = require('express');
const router = express.Router();
const passport = require('passport');
const  User = require('../models/user');
const Campground = require('../models/campgrounds');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// LANDING PAGE ROUTE
router.get('/', (req, res) => {
    res.render('landing');
});

// ================
// AUTH ROUTES
// ================

// SHOW REGISTER FORM
router.get('/register', (req, res) => {
    res.render('register');
});

// HANDLE SIGN UP LOGIC
router.post('/register', (req, res) => {
    let newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    if (req.body.adminCode === 'secretcode123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, (err, user) => {
        if (err) {
            req.flash('error', err.message);
            return res.render('register');
        }
        passport.authenticate('local')(req, res, () => {
            req.flash('success', 'Welcome to YelpCamp ' + user.username);
            res.redirect('/campgrounds');
        });
    });
});

// SHOW LOGIN FORM
router.get('/login', (req, res) => {
    res.render('login');
});

// HANDLING LOGIN LOGIC
router.post('/login', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/login',
    failureFlash: true,
    successFlash: 'Welcome to YelpCamp!'
}), (req, res) => {});

// LOGOUT ROUTE
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', 'See you later!');
    res.redirect('/');
});

// FORGOT PASSWORD ROUTE
router.get('/forgot', (req, res) => {
    res.render('forgot');
});

router.post('/forgot', (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, (err, buf) => {
                let token = buf.toString('hex');
                done(err, token);
            });
        },

        function(token, done) {
            User.findOne({email: req.body.email}, (err, user) => {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000;

                user.save(err => {
                    done(err, token, user);
                });
            });
        },

        function(token, user, done) {
            let smtpTransporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'esteemdesign19@gmail.com',
                    pass: 'princeadebayo'
                }
            });

            let mailOptions = {
                to: user.email,
                from: 'esteemdesign19@gmail.com',
                subject: 'Node.js Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                    'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                    'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                    'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            }

            smtpTransporter.sendMail(mailOptions, err => {
                req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

// RESET PASSWORD ROUTE
router.get('/reset/:token', (req, res) => {
    User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {token: req.params.token});
    });
});

router.post('/reset/:token', (req, res) => {
    async.waterfall([
        function(done) {
            User.findOne({resetPasswordToken: req.body.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }
                if (req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, err => {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(err => {
                            req.logIn(user => {
                                done(err, user);
                            });
                        });
                    });
                } else {
                    req.flash('error', 'Password do not match!');
                    return res.redirect('back');
                }
            });
        },

        function(user, done) {
            let smtpTransporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'esteemdesign19@gmail.com',
                    pass: 'princeadebayo'
                }
            });

            let mailOptions = {
                to: user.email,
                from: 'esteemdesign19@gmail.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                    'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            }

            smtpTransporter.sendMail(mailOptions, err => {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/campgrounds');
    });
});

// USER PROFILE
router.get('/users/:id', (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        if (err) {
            req.flash('error', 'Something went wrong.');
            res.redirect('/');
        } else {
            Campground.find().where('author.id').equals(foundUser._id).exec((err, campground) => {
                if (err) {
                    req.flash('error', 'Something went wrong');
                    res.redirect('/');
                } else {
                    res.render('users/show', {user: foundUser, campgrounds: campground});
                }
            });
        }
    });
});


module.exports = router;