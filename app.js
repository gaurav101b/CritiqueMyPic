if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
// const Joi = require('joi');
const mongoSanitize = require('express-mongo-sanitize');

const MongoStore = require('connect-mongo');

// const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');

// const { postSchema, reviewSchema } = require('./schemas.js')
// const Post = require('./models/post')
// const Review = require('./models/review')
const User = require('./models/user')

const postRoutes = require('./routes/posts');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/critique-pic';
console.log(process.env.DB_URL);
console.log(`Database url : ${dbUrl}`);
// const dbUrl = 'mongodb://localhost:27017/critique-pic';
mongoose.connect(dbUrl, {
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

app.use(express.static(path.join(__dirname, 'public')))

app.use(mongoSanitize({
    replaceWith: '_'
}))

const secret = process.env.SECRET || 'NeedToChoooseABetterSecret!';
const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})
store.on('error', e => {
    console.log("Session store error ", e);
});

const sessionConfig = {
    store,
    // store: MongoStore.create({
    //     mongoUrl: dbUrl,
    //     touchAfter: 24 * 60 * 60
    // }),
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/posts', postRoutes);
app.use('/posts/:id/reviews', reviewRoutes);
app.use('/', userRoutes);

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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`serving on port ${port}`);
})