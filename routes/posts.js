const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post')
// const Review = require('./models/review')
const { postSchema } = require('../schemas.js')
const { isLoggedIn } = require('../middleware');


const validatePost = (req, res, next) => {
    const { error } = postSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(e => e.message).join(', ');
        throw new ExpressError(msg, 400)
    }
    else {
        next();
    }
}


router.get('/', catchAsync(async (req, res) => {
    const posts = await Post.find({});
    res.render('posts/index', { posts });
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})

router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res) => {
    // if (!req.body.post)
    //     throw new ExpressError('Invalid post data', 400);
    req.flash('success', 'Successfully made a new Post!');
    const post = new Post(req.body.post);
    await post.save();
    res.redirect(`/posts/${post._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('reviews');
    if (!post) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/posts');
    }
    res.render("posts/show", { post })
}))

router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/posts');
    }
    res.render("posts/edit", { post })
    // res.render("posts/show", { post })
}))

router.put('/:id', isLoggedIn, validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Successfully Updated the Post!');
    res.redirect(`/posts/${post._id}`)
}))

router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Post!');
    res.redirect('/posts');
}))

module.exports = router;