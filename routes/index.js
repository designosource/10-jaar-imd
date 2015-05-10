var express = require('express');
var router = express.Router();

var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');

var io = require('../io');

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('postcollection');
    collection.find({},{},function(e,docs){
        res.render('index', {
            title: 'IMD Timeline',
            postlist : docs,
            user: req.user,
            feedback: req.flash('feedback')
        });
    });
});

/* POST form to /addpost */
router.post('/addpost', multipartMiddleware, function(req, res) {
    var db = req.db;
    var collection = db.get('postcollection');
    
    var inputUserId = req.user.id;
    var inputName = req.user.displayName;
    var inputMessage = req.body.message;
    var uploadFolder = "";
    
    req.checkBody('message', 'Message was empty.').notEmpty();
    var errors = req.validationErrors();
    
    if (errors) {
        req.flash('feedback', errors);
        res.location("/");
        res.redirect("/");
    } else {
        switch (req.files.image.type) {
            case "image/png":
            case "image/jpeg":
            case "image/gif":
            case "image/svg": 
                uploadFolder = "uploads/images/";
                uploadFile(res, req, req.files.image, uploadFolder, inputUserId, inputName, inputMessage);
                break; 
            default:
                req.flash('feedback', {msg: 'Uploaded file was not an image.'});
                res.location("/");
                res.redirect("/");
                break; 
        }
    }
});

var uploadFile = function(res, req, file, uploadFolder, inputUserId, inputName, inputMessage) {
    var db = req.db;
    var collection = db.get('postcollection');
    
    fs.readFile(file.path, function (err, data) {

		var imageName = file.name;

		if(!imageName){
            res.location("/");
            res.redirect("/");

		} else {
            var newPath = __dirname + "/../public/"+ uploadFolder + imageName;
            
            fs.writeFile(newPath, data, function (err) {
                collection.insert({
                    user_id : inputUserId,
                    name : inputName,
                    message : inputMessage,
                    img : {
                        src: uploadFolder+imageName
                    }
                }, function (err, doc) {
                    if (err) {
                        res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        io.emit('newObject', 
                            {
                                user_id : inputUserId,
                                name : inputName,
                                message : inputMessage,
                                img : {
                                    src: uploadFolder+imageName
                            }
                        });
                        req.flash('feedback', {msg: 'Message succesfully uploaded.'});
                        res.location("/");
                        res.redirect("/");
                    }
                });
            });
		}
	});
}

/* Facebook login */
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { 
    successRedirect : '/', 
    failureRedirect: '/login' 
}), function(req, res) {
        res.redirect('/');
    }
);

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

module.exports = router;
