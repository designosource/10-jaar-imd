var express = require('express');
var router = express.Router();

var fs = require('fs');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();

var io = require('../io');

/* GET home page. */
router.get('/', function(req, res, next) {
    var db = req.db;
    var collection = db.get('postcollection');
    collection.find({},{},function(e,docs){
        res.render('index', {
            title: "IMD's 10th Anniversary",
            postlist : docs,
            user: req.user,
            feedbackType: req.flash('feedbackType'),
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
    var inputDate = req.body.date;
    var uploadFolder = "";
    
    req.checkBody('message', 'Message was empty.').notEmpty();
    req.checkBody('date', 'Date was empty.').notEmpty();  

    var errors = req.validationErrors();
    
    if (errors) {
        req.flash('feedbackType', 'error');
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
                uploadFile(res, req, req.files.image, uploadFolder, inputUserId, inputName, inputMessage, inputDate);
                break; 
            default:
                req.flash('feedbackType', 'error');
                req.flash('feedback', {msg: 'Uploaded file was not an image.'});
                res.location("/");
                res.redirect("/");
                break; 
        }
    }
});

var uploadFile = function(res, req, file, uploadFolder, inputUserId, inputName, inputMessage, inputDate) {
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
                    date: inputDate,
                    img : {
                        src: uploadFolder+imageName
                    }
                }, function (err, doc) {
                    if (err) {
                        res.send("There was a problem adding the information to the database.");
                    }
                    else {
                        req.flash('feedbackType', 'success');
                        req.flash('feedback', {msg: 'Message succesfully uploaded.'});
                        res.location("/");
                        res.redirect("/");
                        io.emit('newObject', 
                            {
                                user_id : inputUserId,
                                name : inputName,
                                date : inputDate,
                                message : inputMessage,
                                img : {
                                    src: uploadFolder+imageName
                            }
                        });
                    }
                });
            });
		}
	});
}

module.exports = router;
