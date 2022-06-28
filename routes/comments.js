const express = require('express');

const middleware = require('../middleware');
const commentController = require('../controller/commentController');

const router = express.Router({ mergeParams: true });

router.route('/new').get(middleware.isLoggedIn, commentController.getComment);

router.route('/').post(middleware.isLoggedIn, commentController.createComment);

router
  .route('/:comment_id/edit')
  .get(middleware.checkCommentOwnership, commentController.editComment);

router
  .route('/:comment_id')
  .put(middleware.checkCommentOwnership, commentController.updateComment)
  .delete(middleware.checkCommentOwnership, commentController.deleteComment);

module.exports = router;
