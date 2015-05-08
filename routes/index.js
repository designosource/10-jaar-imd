var express = require('express');
var router = express.Router();

var fs = require('fs');
var mime = require('mime');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('postcollection');
    collection.find({},{},function(e,docs){
        res.render('index', {
            title: 'IMD Timeline',
            postlist : docs,
            user: req.user
        });
    });
});

/* POST to Add Post Service */
router.post('/addpost', function(req, res) {
    var db = req.db;
    
    var inputUserId = req.user.id;
    var inputName = req.user.displayName;
    var inputMessage = req.body.message;
    var inputImageData = fs.readFileSync('public/images/qr_code_5.jpg');
    inputImageData = inputImageData.toString('base64');
    var inputImageType = mime.lookup('public/images/qr_code_5.jpg');

    var collection = db.get('postcollection');

    collection.insert({
        "user_id" : inputUserId,
        "name" : inputName,
        "message" : inputMessage,
        "img" : {
            "data": inputImageData,
            "type": inputImageType
        }
    }, function (err, doc) {
        if (err) {
            res.send("There was a problem adding the information to the database.");
        }
        else {
            res.location("/");
            res.redirect("/");
        }
    });
});

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
