const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
// const Joi = require('joi');

// const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

// const { postSchema, reviewSchema } = require('./schemas.js')
// const Post = require('./models/post')
// const Review = require('./models/review')

const posts = require('./routes/posts');
const reviews = require('./routes/reviews');


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


app.use('/posts', posts);
app.use('/posts/:id/reviews', reviews);

app.get('/', (req, res) => {
    // res.send("Hi there, this is CritiqueMyPic");
    res.render('home')
})

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