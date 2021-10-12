const express = require('express');
const router = express.Router();

const posts = require('../controllers/posts');
const catchAsync = require('../utils/catchAsync');
// const Post = require('../models/post')
const { isLoggedIn, isAuthor, validatePost } = require('../middleware');

const multer = require('multer');
const { storage } = require('../cloudinary')
const upload = multer({ storage });


router.route('/')
    .get(catchAsync(posts.index))
    .post(isLoggedIn, upload.array('image'), validatePost, catchAsync(posts.createPost))

//this route needs to be before show page, else will think 'new' is an id
router.get('/new', isLoggedIn, posts.renderNewForm)

router.route('/:id')
    .get(catchAsync(posts.showPost))
    .put(isLoggedIn, isAuthor, validatePost, catchAsync(posts.updatePost))
    .delete(isLoggedIn, isAuthor, catchAsync(posts.deletePost))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(posts.renderEditForm))


module.exports = router;