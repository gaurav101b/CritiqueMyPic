const mongoose = require('mongoose');
const Post = require('../models/post');

const RandomWord = require('./randomWords');

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

const seedDB = async () => {
    await Post.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const p = new Post({ title: RandomWord.getRandomWord() });
        await p.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});