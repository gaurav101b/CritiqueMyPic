const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
// const Joi = require('joi');

const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { postSchema, reviewSchema } = require('./schemas.js')
const Post = require('./models/post')
const Review = require('./models/review')

mongoose.connect('mongodb://localhost:27017/critique-pic', {
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error: '));
db.once('open', () => {
    console.log('Database connected');
})


const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


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


app.get('/', (req, res) => {
    // res.send("Hi there, this is CritiqueMyPic");
    res.render('home')
})

app.get('/posts', catchAsync(async (req, res) => {
    const posts = await Post.find({});
    res.render('posts/index', { posts });
}))

app.get('/posts/new', (req, res) => {
    res.render('posts/new');
})

app.post('/posts', validatePost, catchAsync(async (req, res) => {
    // if (!req.body.post)
    //     throw new ExpressError('Invalid post data', 400);

    const post = new Post(req.body.post);
    await post.save();
    res.redirect(`/posts/${post._id}`)
}))

app.get('/posts/:id', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id).populate('reviews');;
    res.render("posts/show", { post })
}))

app.get('/posts/:id/edit', catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    res.render("posts/edit", { post })
    // res.render("posts/show", { post })
}))

app.put('/posts/:id', validatePost, catchAsync(async (req, res) => {
    const { id } = req.params;
    const post = await Post.findByIdAndUpdate(id, { ...req.body.post })
    res.redirect(`/posts/${post._id}`)
}))

app.delete('/posts/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.redirect('/posts');
}))



app.post('/posts/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const post = await Post.findById(req.params.id);
    const review = new Review(req.body.review);
    post.reviews.push(review);
    await review.save();
    await post.save();
    res.redirect(`/posts/${post._id}`);
}))

app.delete('/posts/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Post.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/posts/${id}`);
}))



app.all('*', (req, res, next) => {
    err = new ExpressError('Page not Found', 404);
    // res.render('error404', { err });
    next(err);
})

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'something went wrong' } = err;
    // res.status(statusCode).send(message);
    // res.send("something went wrong")
    res.render('error', { err });
})

app.listen(3000, () => {
    console.log("serving on port 3000");
})