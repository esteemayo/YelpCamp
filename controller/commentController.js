const Comment = require('../models/Comment');
const AppError = require('../utils/appError');
const Campground = require('../models/Campground');
const catchErrors = require('../utils/catchErrors');

exports.getComment = catchErrors(async (req, res, next) => {
    // find camppground by id
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        return next(new AppError('No campground found with that ID', 404));
    }

    res.status(200).render('comments/new', {
        title: 'Add comment',
        campground: campground
    });
});

exports.createComment = catchErrors(async (req, res, next) => {
    // lookup campground using ID
    const campground = await Campground.findById(req.params.id);

    if (!campground) {
        return next(new AppError('No campground found with that ID.', 404));
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
    const comment = await Comment.findById(req.params.comment_id);

    if (!comment) {
        return next(new AppError('No comment found with that ID', 404));
    }

    res.status(200).render('comments/edit', {
        title: 'Edit comment!',
        campground_id: req.params.id,
        comment
    });
});

exports.updateComment = catchErrors(async (req, res, next) => {
    const comment = await Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {
        new: true,
        runValidators: true
    });

    if (!comment) {
        return next(new AppError('No comment found with that ID', 404));
    }

    req.flash('success', 'Comment updated successfully!');
    res.redirect('back');
});

exports.deleteComment = catchErrors(async (req, res, next) => {
    const comment = await Comment.findOneAndDelete(req.params.comment_id);

    if (!comment) {
        return next(new AppError('No comment found with that ID', 404));
    }

    req.flash('success', 'Comment deleted');
    res.redirect('back');
});