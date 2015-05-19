var express = require('express');
var router = express.Router();

var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var io = require('../io');

var mongoose = require('mongoose');
var Post = require('../models/posts');

/* GET home page. */
router.get('/', function(req, res, next) {
    Post.aggregate({ $sort : { date : 1} }, function(err, posts){
        res.render('index', {
            title: "IMD's 10th Anniversary",
            postlist : posts,
            user: req.user,
            feedbackType: req.flash('feedbackType'),
            feedback: req.flash('feedback')
        });
    });
});

/* POST form to /addpost */
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
    var inputDate = req.body.date;
    var uploadFolder = "";
    
    if (errors) {
        req.flash('feedbackType', 'error');
        req.flash('feedback', errors);
        res.redirect("/#addevent");
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
                            src: uploadFolder + req.files.file.name
                        }
                    }
                );
                insertPost(newObject, req, res);
                uploadFile(req.files.file, uploadFolder);
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
                req.flash('feedbackType', 'error');
                req.flash('feedback', {msg: 'Uploaded file was not an image.'});
                res.redirect("/#addevent");
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
            req.flash('feedbackType', 'success');
            req.flash('feedback', {msg: 'Message succesfully uploaded.'});
            res.redirect("/#timeline");
            io.emit('newObject', newObject);
        }
    });
}

var uploadFile = function(file, uploadFolder) {
    fs.readFile(file.path, function (err, data) {
        if(!err) {
            var imageName = file.name;
            var newPath = __dirname + "/../public/"+ uploadFolder + imageName;
            fs.writeFile(newPath, data, function (err) {
                console.log(err);
            });   
        } else {
            console.log(err);
        }
	});
}

module.exports = router;
