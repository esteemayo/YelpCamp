const _ = require('lodash');
const crypto = require('crypto');
const User = require('../models/User');
const sendMail = require('../utils/mail');
const AppError = require('../utils/appError');
const Campground = require('../models/Campground');
const catchErrors = require('../utils/catchErrors');

exports.registerForm = (req, res) => {
    if (req.isAuthenticated()) return res.redirect('/');

    res.status(200).render('register', {
        title: 'Register your account!'
    });
}

exports.register = catchErrors(async (req, res, next) => {
    let avatar;
    if (req.file) avatar = req.file.filename;

    const newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        emailToken: crypto.randomBytes(64).toString('hex'),
        avatar
    });
    
    if (req.body.adminCode === 'secretcode123') {
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, async (err, user) => {
        if (err) {
            req.flash('error', err.message);
            return res.status(200).render('register', {
                title: 'Create your account!'
            });
        }

        try {
            await sendMail({
                email: user.email,
                subject: 'YelpCamp - verify your email',
                text: `
                    Hello, thanks for registering on our site.
                    Please copy and paste the address below to verify your account
                    ${req.protocol}://${req.get('host')}/users/register/verify-email?token=${user.emailToken}
                `,
                html: `
                    <h1>Hello,</h1>
                    <p>Thanks for registering on our site.</p>
                    <p>Please click the link below to verify your account.</p>
                    <a href="${req.protocol}://${req.get('host')}/users/register/verify-email?token=${user.emailToken}">Verify your account</a>
                `
            });

            req.flash('success', 'Thanks for registering please check your email to verify your account.');
            res.redirect('/');
        } catch (err) {
            req.flash('error', 'Oops! Something went wrong. Please contact us for assistance.');
            res.redirect('/');
        }
    });
});

exports.verifyEmail = catchErrors(async (req, res, next) => {
    const user = await User.findOne({ emailToken: req.query.token });

    if (!user) {
        req.flash('error', 'Oops! Token is invalid. Please contact us for assistance.');
        return res.redirect('/');
    }

    user.emailToken = undefined;
    user.isVerified = true;
    await user.save();
    await req.logIn(user, err => {
        if (err) return next(err);
        req.flash('success', `Welcome to YelpCamp ${user.email}`);
        const redirectUrl = req.session.redirectTo || '/';
        delete req.session.redirectTo;
         res.redirect(redirectUrl);
    });
});

exports.account = catchErrors(async (req, res, next) => {
    const campgrounds = await Campground
        .find()
        .where('author.id')
        .equals(req.user._id)
        .sort('-date');

    res.status(200).render('account', {
        title: 'User account settings',
        campgrounds
    });
});

exports.updateUserData = catchErrors(async (req, res, next) => {
    const filterBody = _.pick(req.body, ['firstName', 'lastName', 'email']);
    if (req.file) filterBody.avatar = req.file.filename;

    await User.findByIdAndUpdate(req.user._id, filterBody, {
        new: true,
        runValidators: true
    });

    req.flash('success', 'Your account data was successfully updated.');
    res.redirect('/users/account/me');
});

exports.userProfile = catchErrors(async (req, res, next) => {
    const user = await User.findOne({ username: req.params.username });
    const campgrounds = await Campground
        .find({ 'author.username': user.username })
        .sort('-date');

    if (!user) {
        return next(new AppError('No user found with that ID', 400));
    }

    res.status(200).render('users/profile', {
        title: `${user.fullName}'s profile!`,
        campgrounds,
        user
    });
});