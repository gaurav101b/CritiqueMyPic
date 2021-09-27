const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: String,
    image: String,
    info: String,
    description: String
})

module.exports = mongoose.model('Post', PostSchema);