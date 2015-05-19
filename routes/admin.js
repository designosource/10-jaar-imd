var express = require('express');
var router = express.Router();

var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

var mongoose = require('mongoose');
var User = require('../models/users');
var Post = require('../models/posts');

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// used to deserialize the user
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

passport.use('local', new LocalStrategy({ passReqToCallback : true},
    function(req, username, password, done) {
        User.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            }
            if (!user.validPassword(password)) {
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            }
            return done(null, user);
        });
    }
));

router.get('/', function(req, res, next) {
    Post.find(function(err, posts){
        res.render('admin', {
            title: "Overzicht | Admin",
            user: req.user,
            postlist: posts
        });
    });
});

router.get('/new', function(req, res, next) {
    if(req.user && req.user.group == 'admin') {
        Post.find(function(err, posts){
            res.render('admin-new', {
                title: "Toevoegen | Admin",
                user: req.user,
                postlist: posts
            });
        });   
    } else {
        res.redirect('/admin');
    }
});

router.get('/delete', function(req, res, next) {
    if(req.user && req.user.group == 'admin') {
        Post.find(function(err, posts){
            res.render('admin-delete', {
                title: "Verwijderen | Admin",
                user: req.user,
                postlist: posts
            });
        });   
    } else {
        res.redirect('/admin');
    }
});

router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/admin');
});

router.post('/login', 
            passport.authenticate('local', 
                { successRedirect: '/admin',
                failureRedirect: '/admin',
                failureFlash: true })
);

/*passport.use('local-signup', new LocalStrategy({passReqToCallback : true},
    function(req, id, displayName, email, password, group, done) {
        id="656252354403643";
        displayName = "WeAreIMD";
        email = "weareimd";
        password = "uniekdigitaalverhaal";
        group = "admin";
        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'username' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.id = id;
                newUser.displayName = displayName;
                newUser.username   = email;
                newUser.password = newUser.generateHash(password);
                newUser.group = group;

                // save the user
                newUser.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, newUser);
                });
            }

        });    

        });
}));

router.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true// allow flash messages
}));*/


module.exports = router;
