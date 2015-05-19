var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema = new Schema({
    user_id : Number,
    name : String,
    title: String,
    message : String,
    date : String,
    asset: {
        src: String
    }
});

var Post = mongoose.model('Post', postsSchema);

module.exports = Post;