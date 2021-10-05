const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Post = require('../models/post')
// const Review = require('./models/review')
const { postSchema } = require('../schemas.js')


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

router.get('/new', (req, res) => {
    res.render('posts/new');
})

router.post('/', validatePost, catchAsync(async (req, res) => {
    // if (!req.body.post)
    //     throw new ExpressError('Invalid post data', 400);

    const post = new Post(req.body.post);
    await post.save();
    res.redirect(`/posts/${post._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('reviews');;
    res.render("posts/show", { post })
}))

router.get('/:id/edit', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render("posts/edit", { post })
    // res.render("posts/show", { post })
}))

router.put('/:id', validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post })
    res.redirect(`/posts/${post._id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect('/posts');
}))

module.exports = router;