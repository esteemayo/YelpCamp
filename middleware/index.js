const catchErrors = require('../utils/catchErrors');
const Campground = require('../models/Campgrounds');
const Comment = require('../models/Comment');
const User = require('../models/User');

let middleware = {};

middleware.checkCampgroundOwnership = catchErrors(async (req, res, next) => {
    if (req.isAuthenticated()) {
        const campground = await Campground.findById(req.params.id);

        if (!campground) {
            req.flash('error', 'Campground not found');
            return res.redirect('back');
        }

        if (campground.author.id.equals(req.user._id) || req.user.isAdmin) return next();

        req.flash('error', 'You don\'t have permission to do that');
        res.redirect('back');
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('back');
    }
});

middleware.checkCommentOwnership = catchErrors(async (req, res, next) => {
    if (req.isAuthenticated()) {
        const comment = await Comment.findById(req.params.comment_id);

        if (!comment) {
            return res.redirect('back');
        }

        if (comment.author.id.equals(req.user._id) || req.user.isAdmin) return next();

        req.flash('error', 'You don\'t have permission to do that');
        res.redirect('back');
    } else {
        req.flash('error', 'You need to be logged in to do that');
        res.redirect('back');
    }
});

middleware.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) return next();

    req.flash('error', 'You need to be logged in to do that');
    res.redirect('/auth/login');
}

middleware.isNotVerified = catchErrors(async (req, res, next) => {
        const user = await User.findOne({ username: req.body.username });
        if (user.isVerified) return next();

        req.flash('error', 'Your account has not been verified. Please check your email to verify your account!');
        return res.redirect('/');
});

module.exports = middleware;