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
            title: "Overzicht | Admin IMD Alumni",
            user: req.user,
            postlist: posts
        });
    });
});

router.get('/new', function(req, res, next) {
    if(req.user && req.user.group == 'admin') {
        Post.find(function(err, posts){
            res.render('admin-new', {
                title: "Toevoegen | Admin IMD Alumni",
                user: req.user,
                postlist: posts,
                success: req.flash('successMessage'),
                error: req.flash('errorMessage')
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
                title: "Verwijderen | Admin IMD Alumni",
                user: req.user,
                postlist: posts,
                success: req.flash('successMessage'),
                error: req.flash('errorMessage')
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

module.exports = router;