const express = require('express');
const { isNotVerified } = require('../middleware/index');
const authController = require('../controller/authController');

const router = express.Router();

// Show login form && handling login logic
router
    .route('/login')
    .get(authController.loginForm)
    .post(
        isNotVerified,
        authController.login
    );

// Logout route
router.get('/logout', authController.logout);

router
    .route('/forgot')
    .get(authController.forgotForm)
    .post(authController.forgotPassword);

router
    .route('/reset/:token')
    .get(authController.reset)
    .post(authController.resetPassword);

module.exports = router;