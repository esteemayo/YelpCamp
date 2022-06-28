const crypto = require('crypto');
const passport = require('passport');
const { StatusCodes } = require('http-status-codes');

const User = require('../models/User');
const sendMail = require('../utils/mail');
const catchErrors = require('../utils/catchErrors');

exports.loginForm = (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');

  res.status(StatusCodes.OK).render('login', {
    title: 'Log into your account!',
  });
};

exports.login = passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/auth/login',
  failureFlash: true,
  successFlash: 'Welcome to YelpCamp!',
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'See you later!');
  res.status(StatusCodes.OK).redirect('/');
};

exports.forgotForm = (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/');

  res.status(StatusCodes.OK).render('forgot', {
    title: 'Forgot password',
  });
};

exports.forgotPassword = catchErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    req.flash('error', 'No account with that email address exists.');
    return res.redirect('/auth/forgot');
  }

  // Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/auth/reset/${resetToken}`;

  const message = `
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
    <p><a href="${resetURL}">Reset link</a></p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
`;

  const html = `
    <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
    <p>Please click on the following link, or paste this into your browser to complete the process:</p>
    <p><a href="${resetURL}">Reset link</a></p>
    <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
`;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your password reset token (valid for 1 hour)',
      message,
      html,
    });

    req.flash('success', `You have been emailed a password reset link.`);
    // redirect to login page
    res.status(StatusCodes.OK).redirect('/auth/login');
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    req.flash(
      'error',
      'There was an error sending the email. Try again later.'
    );
    res.status(StatusCodes.OK).redirect('/auth/forgot');
  }
});

exports.reset = catchErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('back');
  }

  res.status(StatusCodes.OK).render('reset', {
    title: 'Reset your password',
  });
});

exports.resetPassword = catchErrors(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.flash('error', 'Password reset token is invalid or has expired.');
    return res.redirect('back');
  }

  if (req.body.password === req.body.confirm) {
    user.setPassword(req.body.password, async (err) => {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();
      await req.logIn(user, (err) => {
        if (err) return next(err);
        req.flash(
          'success',
          '💃 Nice! Your password has been reset! You are now logged in!'
        );
        const redirectUrl = req.session.redirectTo || '/';
        delete req.session.redirectTo;
        res.redirect(redirectUrl);
      });
    });
  } else {
    req.flash('error', 'Passwords do not match');
    res.redirect('back');
  }

  const message = `
    <p>Hello,</p>
    <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>
`;
  const html = `
    <p>Hello,</p>
    <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>
`;

  try {
    await sendMail({
      email: user.email,
      subject: 'Your password has been changed.',
      message,
      html,
    });

    req.flash('success', 'Success! Your password has been changed.');
  } catch (err) {
    req.flash(
      'error',
      'There was an error sending the email. Try again later.'
    );
  }
});
