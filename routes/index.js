var express = require('express');
var router = express.Router();

var fs = require('fs');
var lwip = require('lwip');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var io = require('../io');
var moment = require('moment');

var mongoose = require('mongoose');
var Post = require('../models/posts');


router.get('/', function(req, res, next) {
    Post.aggregate({ $sort : { date : 1} }, function(err, posts){
        for(var i = 0; i < posts.length; i++) {
            posts[i].date = moment(posts[i].date).format('DD-MM-YYYY');
        }
        res.render('index', {
            title: "De Jubilee van IMD",
            postlist : posts,
            user: req.user,
            success: req.flash('successMessage'),
            error: req.flash('errorMessage')
        });
    });
});

router.post('/deletepost', function(req, res) {
    var postId = req.body.data;
    
    Post.remove({_id: postId}, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.send('De post is succesvol gedeletet.');
        }
    });
});

router.post('/addpost', multipartMiddleware, function(req, res) {
    req.body.title = req.body.title.replace(/<[^>]*>/g,'');
    req.body.message = req.body.message.replace(/<[^>]*>/g,'');
    
    req.checkBody('title', 'Er was geen titel opgegeven.').notEmpty();
    req.checkBody('message', 'Er was geen boodschap opgegeven.').notEmpty();
    req.checkBody('date', 'Er is een ongeldige datum opgegeven.').notEmpty().isDate().checkDate();  
    
    var errors = req.validationErrors();
    
    var inputUserId = req.user.id;
    var inputName = req.user.displayName;
    var inputTitle = req.body.title;
    var inputMessage = req.body.message;
    var inputDate = new Date(req.body.date.replace(/(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3"));
    var inputTimestamp = Date.now();
    
    if (errors) {
        req.flash('errorMessage', errors);
        if(req.user.group === 'admin') {
            res.redirect("/admin/new");
        } else {
            res.redirect("/#addevent");
        }
    } else {
        switch (req.files.file.type) {
            case "image/png":
            case "image/jpeg":
                lwip.open(req.files.file.path, function(err, image){
                    var filename = req.files.file.originalFilename;
                    var type = filename.substr(filename.length - 3);
                    type = type.toLowerCase();
                    var width = image.width();
                    var wRatio = 500 / width;
                    image.scale(wRatio, function(err, image){
                        image.toBuffer(type, function(err, buffer){
                            var newObject = new Post(
                                {
                                    user_id : inputUserId,
                                    name : inputName,
                                    title: inputTitle,
                                    message : inputMessage,
                                    date : inputDate,
                                    asset : {
                                        base : buffer,
                                        content_type : req.files.file.type
                                    }
                                }
                            );
                            insertPost(newObject, req, res);
                        });
                    });
                });
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
            var socketObject = {};
            socketObject.user_id = newObject.user_id;
            socketObject.name = newObject.name;
            socketObject.title = newObject.title;
            socketObject.message = newObject.message;
            socketObject.date = moment(newObject.date).format('DD-MM-YYYY');
            if(newObject.asset.base && newObject.asset.content_type) {
                socketObject.asset = {
                    base : newObject.asset.base.toString('base64'),
                    content_type : newObject.asset.content_type
                }
            }
            io.emit('newObject', socketObject);
        }
    });
}

module.exports = router;