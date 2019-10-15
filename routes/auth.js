const express = require('express');
const router = express.Router();
const passport = require('passport');

// SHOW LOGIN FORM
router.get('/', (req, res) => {
    res.render('login');
});

// HANDLING LOGIN LOGIC
router.post('/', passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/auth/login',
    failureFlash: true,
    successFlash: 'Welcome to YelpCamp!'
}), (req, res) => { });


module.exports = router;