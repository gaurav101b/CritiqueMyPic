const express = require('express');
const router = express.Router({ mergeParams: true });

const Post = require('../models/post')
const Review = require('../models/review')
const { reviewSchema } = require('../schemas.js')

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const { isLoggedIn } = require('../middleware');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(', ');
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const review = new Review(req.body.review);
    post.reviews.push(review);
    await review.save();
    await post.save();
    req.flash('success', 'Successfully made a Review!');
    res.redirect(`/posts/${post._id}`);
}))

router.delete('/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Removed Review!');
    res.redirect(`/posts/${id}`);
}))

module.exports = router;