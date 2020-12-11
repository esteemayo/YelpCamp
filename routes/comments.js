const express = require('express');
const middleware = require('../middleware');
const commentController = require('../controller/commentController');

const router = express.Router({ mergeParams: true });

// comment route
router
    .route('/new')
    .get(
        middleware.isLoggedIn,
        commentController.getComment
    );

// post - comment route
router
    .route('/')
    .post(
        middleware.isLoggedIn,
        commentController.createComment
    );

// comment edit route
router
    .route('/:comment_id/edit')
    .get(
        middleware.checkCommentOwnership,
        commentController.editComment
    );

// comment update && comment desctroy route
router
    .route('/:comment_id')
    .put(
        middleware.checkCommentOwnership,
        commentController.updateComment
    )
    .delete(
        middleware.checkCommentOwnership,
        commentController.deleteComment
    );

module.exports = router;