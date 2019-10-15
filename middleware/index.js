const Campground = require('../models/Campgrounds');
const Comment = require('../models/Comment');

let middleware = {};

middleware.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if (err) {
                res.flash('error', 'Campground not found');
                res.redirect('back');
            } else {
                if (foundCampground.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error', 'You don\'t have permission to do that');
                    res.redirect('back');
                }
            }
        });
    } else {
        res.redirect('back');
    }
}

middleware.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, (err, foundComment) => {
            if (err) {
                res.redirect('back');
            } else {
                if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
                    next();
                } else {
                    req.flash('error', 'You don\'t have permission to do that');
                    res.redirect('back');
                }
            }
        });
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('back');
    }
}

middleware.isLoggedIn = function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/login');
}

module.exports = middleware;