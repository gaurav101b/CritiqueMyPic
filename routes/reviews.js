const express = require('express');
const router = express.Router({ mergeParams: true });

// const Post = require('../models/post');
// const Review = require('../models/review');

const reviews = require('../controllers/reviews');

const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isReviewAuthor, validateReview } = require('../middleware');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview))

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;