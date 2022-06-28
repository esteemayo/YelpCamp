const express = require('express');

const { isNotVerified } = require('../middleware/index');
const authController = require('../controller/authController');

const router = express.Router();

router
  .route('/login')
  .get(authController.loginForm)
  .post(isNotVerified, authController.login);

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
