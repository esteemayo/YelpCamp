const express = require('express');
const userController = require('../controller/userController');
const imageController = require('../controller/imageController');
const { isLoggedIn } = require('../middleware/index');

const router = express.Router();

// Show register form && handle sign up logic
router
    .route('/register')
    .get(userController.registerForm)
    .post( 
        imageController.upload,
        imageController.resize,
        userController.register
    );

router.get('/register/verify-email', userController.verifyEmail);

router.get('/account/me', isLoggedIn, userController.account);

router.post('/submit-user-data',
    isLoggedIn,
    imageController.upload,
    imageController.resize,
    userController.updateUserData
);

router.get('/:id', userController.userProfile);

module.exports = router;