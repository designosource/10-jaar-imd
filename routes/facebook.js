var express = require('express');
var router = express.Router();

var config = require('../configuration/config');

var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var session = require('express-session');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: "/facebook/auth/facebook/callback"
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        return done(null, profile);
    });
}));

/* Facebook login */
router.get('/auth/facebook', passport.authenticate('facebook'));

router.get('/auth/facebook/callback', passport.authenticate('facebook', { 
    successRedirect : '/', 
    failureRedirect: '/login' 
}), function(req, res) {
        res.location('/');
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
