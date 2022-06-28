const express = require('express');

const middleware = require('../middleware');
const campgroundController = require('../controller/campgroundController');

const router = express.Router();

router
  .route('/')
  .get(middleware.isLoggedIn, campgroundController.getAllCampgrounds)
  .post(campgroundController.upload, campgroundController.createCampground);

router.get(
  '/page/:page',
  middleware.isLoggedIn,
  campgroundController.getAllCampgrounds
);

router.route('/new').get(middleware.isLoggedIn, campgroundController.add);

router.get('/:slug', campgroundController.getCampgroundBySlug);

router
  .route('/:id/edit')
  .get(
    middleware.checkCampgroundOwnership,
    campgroundController.editCampground
  );

router
  .route('/:id')
  .put(campgroundController.upload, campgroundController.updateCampground)
  .delete(campgroundController.deleteCampground);

module.exports = router;
