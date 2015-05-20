var express = require('express');
var router = express.Router();

var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var io = require('../io');

var mongoose = require('mongoose');
var Post = require('../models/posts');


router.get('/', function(req, res, next) {
    Post.aggregate({ $sort : { date : 1} }, function(err, posts){
        for(var i = 0; i < posts.length; i++) {
            posts[i].date = (posts[i].date.getDate() + '-' + (posts[i].date.getMonth() + 1) + '-' + posts[i].date.getFullYear());
        }
        res.render('index', {
            title: "IMD's 10th Anniversary",
            postlist : posts,
            user: req.user,
            success: req.flash('successMessage'),
            error: req.flash('errorMessage')
        });
    });
});

router.post('/deletepost', function(req, res) {
    var postId = req.body.data;
    
    Post.findOne({ _id: postId}, { asset: 1 }, function(err, post) {
        if(post.asset.src){
            fs.unlink(__dirname + "/../public/" + post.asset.src, function (err) {
                if(err) {
                    console.log(err); 
                } else {
                    Post.remove({_id: postId}, function (err) {
                        if (err) {
                            console.log(err);
                        } else {
                            res.send('De post is succesvol gedeletet.');
                        }
                    });
                }
            });
        } else {
            Post.remove({_id: postId}, function (err) {
                if (err) {
                    console.log(err);
                } else {
                    res.send('De post is succesvol gedeletet.');
                }
            });
        }
    });
});

router.post('/addpost', multipartMiddleware, function(req, res) {
    req.body.title = req.body.title.replace(/<[^>]*>/g,'');
    req.body.message = req.body.message.replace(/<[^>]*>/g,'');
    
    req.checkBody('title', 'Er was geen titel opgegeven.').notEmpty();
    req.checkBody('message', 'Er was geen boodschap opgegeven.').notEmpty();
    req.checkBody('date', 'Het datum veld was leeg.').notEmpty();   
    
    var errors = req.validationErrors();
    
    var inputUserId = req.user.id;
    var inputName = req.user.displayName;
    var inputTitle = req.body.title;
    var inputMessage = req.body.message;
    var inputDate = new Date(req.body.date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    var inputTimestamp = Date.now();
    var uploadFolder = "";
    
    if (errors) {
        req.flash('errorMessage', errors);
        if(req.user.group === 'admin') {
            res.redirect("/admin/new");
        } else {
            res.redirect("/#addevent");
        }
        console.log(errors);
    } else {
        switch (req.files.file.type) {
            case "image/png":
            case "image/jpeg":
            case "image/gif":
            case "image/svg": 
                uploadFolder = "uploads/images/";
                var newObject = new Post(
                    {
                        user_id : inputUserId,
                        name : inputName,
                        title: inputTitle,
                        message : inputMessage,
                        date : inputDate,
                        asset: {
                            src: uploadFolder + inputTimestamp + "-" + req.files.file.name
                        }
                    }
                );
                insertPost(newObject, req, res);
                uploadFile(req.files.file, uploadFolder, inputTimestamp);
                break; 
            case "application/octet-stream":
                var newObject = new Post(
                    {
                        user_id : inputUserId,
                        name : inputName,
                        title: inputTitle,
                        message : inputMessage,
                        date : inputDate
                    }
                );
                insertPost(newObject, req, res);
                break;
            default:
                req.flash('errorMessage', {msg: 'De geüploade file was geen geldige afbeelding.'});
                if(req.user.group === 'admin') {
                    res.redirect("/admin/new");
                } else {
                    res.redirect("/#addevent");
                }
                break; 
        }
    }
});

var insertPost = function(newObject, req, res) {
    newObject.save(function (err, data) {
        if(err) {
            res.send("There was a problem adding the information to the database." + err);
        }
        else {
            req.flash('successMessage', {msg: 'De post is succesvol geüpload.'});
            if(req.user.group === 'admin') {
                res.redirect("/admin/new");
            } else {
                res.redirect("/#timeline");
            }
            io.emit('newObject', newObject);
        }
    });
}

var uploadFile = function(file, uploadFolder, inputTimestamp) {
    fs.readFile(file.path, function (err, data) {
        if(!err) {
            var imageName = file.name;
            var newPath = __dirname + "/../public/" + uploadFolder + inputTimestamp + "-" + imageName;
            fs.writeFile(newPath, data, function (err) {
                console.log(err);
            });   
        } else {
            console.log(err);
        }
	});
}

module.exports = router;