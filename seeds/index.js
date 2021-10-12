const mongoose = require('mongoose');
const Post = require('../models/post');
const Review = require('../models/review');

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
    await Review.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const p = new Post({
            title: RandomWord.getRandomWord(),
            image: 'https://source.unsplash.com/random',
            // image: 'https://picsum.photos/500/500',

            author: '615ebcb4a94303546be58ebe', //(for username : aa, password : aa )

            info: `ISO : ${Math.floor(Math.random() * 11) * 100}, 
            shutter : ${Math.floor(Math.random() * 20) * 10}`,

            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Eaque, laudantium reiciendis necessitatibus deserunt dicta odio similique cumque accusantium veniam minus! Vero suscipit doloribus fugit nemo mollitia magni ex cum labore.'
        });
        await p.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});