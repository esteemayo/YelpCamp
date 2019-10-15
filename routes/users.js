const express = require('express');
const router = express.Router();
const Campground = require('../models/Campgrounds');
const User = require('../models/User');

// USER PROFILE
router.get('/', (req, res) => {
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