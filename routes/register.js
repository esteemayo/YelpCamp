const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');


// SHOW REGISTER FORM
router.get('/', (req, res) => {
    res.render('register');
});

// HANDLE SIGN UP LOGIC
router.post('/', (req, res) => {
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
            req.flash('success', `Welcome to YelpCamp ${user.username}`);
            res.redirect('/campgrounds');
        });
    });
});


module.exports = router;