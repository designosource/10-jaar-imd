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
    Post.find(function(err, posts){
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
    var inputUserId = req.user.id;
    var inputName = req.user.displayName;
    var inputTitle = req.body.title;
    var inputMessage = req.body.message;
    var inputDate = req.body.date;
    var uploadFolder = "";
    
    req.checkBody('title', 'Title was empty.').notEmpty();
    req.checkBody('message', 'Message was empty.').notEmpty();
    req.checkBody('date', 'Date was empty.').notEmpty();  

    var errors = req.validationErrors();
    
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
                uploadFile(res, req, req.files.file, uploadFolder, inputUserId, inputName, inputTitle, inputMessage, inputDate);
                break; 
            case "file/mp4":
                uploadFolder = "uploads/video/";
                uploadFile(res, req, req.files.file, uploadFolder, inputUserId, inputName, inputTitle, inputMessage, inputDate);
            default:
                req.flash('feedbackType', 'error');
                req.flash('feedback', {msg: 'Uploaded file was not an image.'});
                res.redirect("/#addevent");
                break; 
        }
    }
});

var uploadFile = function(res, req, file, uploadFolder, inputUserId, inputName, inputTitle, inputMessage, inputDate) {
    fs.readFile(file.path, function (err, data) {

		var imageName = file.name;

        var newPath = __dirname + "/../public/"+ uploadFolder + imageName;
        var newObject = new Post(
            {
                user_id : inputUserId,
                name : inputName,
                title: inputTitle,
                message : inputMessage,
                date : inputDate,
                asset: {
                    src: uploadFolder+imageName
                }
            });

        fs.writeFile(newPath, data, function (err) {
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
        });
	});
}

module.exports = router;
