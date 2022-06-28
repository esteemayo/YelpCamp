const { StatusCodes } = require('http-status-codes');

const Comment = require('../models/Comment');
const AppError = require('../utils/appError');
const Campground = require('../models/Campground');
const catchErrors = require('../utils/catchErrors');

exports.getComment = catchErrors(async (req, res, next) => {
  const { id: campgroundId } = req.params;
  // find camppground by id
  const campground = await Campground.findById(campgroundId);

  if (!campground) {
    return next(
      new AppError(
        `No campground found with that ID → ${campgroundId}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  res.status(StatusCodes.OK).render('comments/new', {
    title: 'Add comment',
    campground: campground,
  });
});

exports.createComment = catchErrors(async (req, res, next) => {
  const { id: campgroundId } = req.params;
  // lookup campground using ID
  const campground = await Campground.findById(campgroundId);

  if (!campground) {
    return next(
      new AppError(
        `No campground found with that ID → ${campgroundId}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  // create new comment
  const comment = await Comment.create(req.body.comment);
  // add username and id to comment
  comment.author.id = req.user._id;
  comment.author.username = req.user.username;
  // save comment
  await comment.save();

  // connect new comment to campground
  campground.comments.push(comment);
  await campground.save();
  // redirect campground show page
  req.flash('success', 'Successfully added comment');
  res.redirect('back');
});

exports.editComment = catchErrors(async (req, res, next) => {
  const { comment_id: commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    return next(
      new AppError(
        `No comment found with that ID → ${commentId}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  res.status(StatusCodes.OK).render('comments/edit', {
    title: 'Edit comment!',
    campground_id: req.params.id,
    comment,
  });
});

exports.updateComment = catchErrors(async (req, res, next) => {
  const { comment_id: commentId } = req.params;

  const comment = await Comment.findByIdAndUpdate(commentId, req.body.comment, {
    new: true,
    runValidators: true,
  });

  if (!comment) {
    return next(
      new AppError(
        `No comment found with that ID → ${commentId}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  req.flash('success', 'Comment updated successfully!');
  res.redirect('back');
});

exports.deleteComment = catchErrors(async (req, res, next) => {
  const { comment_id: commentId } = req.params;

  const comment = await Comment.findOneAndDelete(commentId);

  if (!comment) {
    return next(
      new AppError(
        `No comment found with that ID → ${commentId}`,
        StatusCodes.NOT_FOUND
      )
    );
  }

  req.flash('success', 'Comment deleted');
  res.redirect('back');
});
