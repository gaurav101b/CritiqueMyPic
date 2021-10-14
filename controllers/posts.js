const Post = require('../models/post')
const { cloudinary } = require('../cloudinary');

module.exports.index = async (req, res) => {
    const posts = await Post.find({});
    res.render('posts/index', { posts });
}

module.exports.renderNewForm = (req, res) => {
    res.render('posts/new');
}

module.exports.createPost = async (req, res) => {
    const post = new Post(req.body.post);
    post.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    post.author = req.user._id;
    await post.save();
    req.flash('success', 'Successfully made a new Post!');
    res.redirect(`/posts/${post._id}`)
}

module.exports.showPost = async (req, res) => {
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
}

module.exports.renderEditForm = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        req.flash('error', 'Cannot find that Post!');
        return res.redirect('/posts');
    }
    res.render("posts/edit", { post })
}

module.exports.updatePost = async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post });
    req.flash('success', 'Successfully Updated the Post!');
    res.redirect(`/posts/${post._id}`)
}

module.exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const post = await Post.findById(req.params.id);
    for (let img of post.images) {
        await cloudinary.uploader.destroy(img.filename);
    }
    await Post.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted Post!');
    res.redirect('/posts');
}