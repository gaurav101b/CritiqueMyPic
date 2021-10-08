const express = require('express');
const router = express.Router();

const catchAsync = require('../utils/catchAsync');
const Post = require('../models/post')
const { isLoggedIn, isAuthor, validatePost } = require('../middleware');


router.get('/', catchAsync(async (req, res) => {
    const posts = await Post.find({});
    res.render('posts/index', { posts });
}))

router.get('/new', isLoggedIn, (req, res) => {
    res.render('posts/new');
})

router.post('/', isLoggedIn, validatePost, catchAsync(async (req, res) => {
    const post = new Post(req.body.post);
    post.author = req.user._id;
    await post.save();
    req.flash('success', 'Successfully made a new Post!');
    res.redirect(`/posts/${post._id}`)
}))

router.get('/:id', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');

    if (!post) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/posts');
    }
    res.render("posts/show", { post })
}))

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/posts');
    }
    res.render("posts/edit", { post })
}))

router.put('/:id', isLoggedIn, isAuthor, validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Successfully Updated the Post!');
    res.redirect(`/posts/${post._id}`)
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Post!');
    res.redirect('/posts');
}))

module.exports = router;