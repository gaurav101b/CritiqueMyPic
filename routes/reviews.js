const express = require('express');
const router = express.Router({ mergeParams: true });

const Post = require('../models/post')
const Review = require('../models/review')

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    post.reviews.push(review);
    await review.save();
    await post.save();
    req.flash('success', 'Successfully made a Review!');
    res.redirect(`/posts/${post._id}`);
}))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Removed Review!');
    res.redirect(`/posts/${id}`);
}))

module.exports = router;