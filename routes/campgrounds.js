const express = require('express');
const middleware = require('../middleware');
const campgroundController = require('../controller/campgroundController');

const router = express.Router();

// Get all campgrounds route && create new campground route
router
    .route('/')
    .get(
        middleware.isLoggedIn,
        campgroundController.getAllCampgrounds
    )
    .post(
        campgroundController.upload,
        campgroundController.createCampground
    );

router.get('/page/:page',
        middleware.isLoggedIn,
        campgroundController.getAllCampgrounds
);

// Get new campground form route
router
    .route('/new')
    .get(
        middleware.isLoggedIn,
        campgroundController.add
    );

// Get campground by slug route
router.get('/:slug', campgroundController.getCampgroundBySlug);

// Edit campground route
router
    .route('/:id/edit')
    .get(
        middleware.checkCampgroundOwnership,
        campgroundController.editCampground
    );

// Update campground route && destroy campground route
router
    .route('/:id')
    .put(
        campgroundController.upload,
        campgroundController.updateCampground
    )
    .delete(
        campgroundController.deleteCampground
    );

module.exports = router;