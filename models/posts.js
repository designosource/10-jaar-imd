var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var postsSchema = new Schema({
    user_id : Number,
    name : String,
    title: String,
    message : String,
    date : Date,
    asset : {
        base : { type : Buffer },
        content_type : { type : String }
    }
});

var Post = mongoose.model('Post', postsSchema);

module.exports = Post;