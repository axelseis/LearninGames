


var LocalStrategy = require('passport-local'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    FacebookStrategy = require('passport-facebook'),
    MockStrategy = require('./strategyMock.js'),
    CameraStrategy = require('./strategyCamera.js'),
    config = require('./auth.js'), 
    funct = require('./passportFunctions.js');

module.exports = function(passport) {

	passport.use('test-login', new MockStrategy({passReqToCallback : true}, funct.testAuth));

	passport.use('camera-login', new CameraStrategy({passReqToCallback : false}, funct.cameraAuth));

	passport.use(new GoogleStrategy(
	  {
	    passReqToCallback : true,
	    clientID        : config.googleAuth.clientID,
	    clientSecret    : config.googleAuth.clientSecret,
	    callbackURL     : config.googleAuth.callbackURL,
	  },
	  function(req, token, refreshToken, profile, done) {
	    funct.googleAuth(profile)
	    .then(function (user) {
	      if (user) {
	        console.log("LOGGED IN GOOGLE AS: " + user.username);
	        req.session.success = 'You are successfully logged in ' + user.username + '!';
	        done(null, user);
	      }
	      if (!user) {
	        console.log("COULD NOT LOG IN GOOGLE");
	        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
	        done(null, user);
	      }
	    })
	    .fail(function (err){
	      console.log("ERROR googleAuth: " + JSON.stringify(err));
	    });
	  }
	));

	passport.use(new FacebookStrategy(
	  {
	    passReqToCallback : true,
	    clientID        : config.facebookAuth.clientID,
	    clientSecret    : config.facebookAuth.clientSecret,
	    callbackURL     : config.facebookAuth.callbackURL,
	    profileFields: ['id', 'email', 'picture', 'displayName']
	  },
	  function(req, token, refreshToken, profile, done) {
	    funct.facebookAuth(profile)
	    .then(function (user) {
	      if (user) {
	        console.log("LOGGED IN FACEBOOK AS: " + user.username);
	        req.session.success = 'You are successfully logged in ' + user.username + '!';
	        done(null, user);
	      }
	      if (!user) {
	        console.log("COULD NOT LOG IN GOOGLE");
	        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
	        done(null, user);
	      }
	    })
	    .fail(function (err){
	      console.log("ERROR facebookAuth: " + JSON.stringify(err));
	    });
	  }
	));

	// Passport session setup.
	passport.serializeUser(function(user, done) {
	  //console.log("serializing ", user);
	  done(null, user);
	});

	passport.deserializeUser(function(obj, done) {
	  //console.log("deserializing ", obj);
	  done(null, obj);
	});

/*
	passport.use('local-signin', new LocalStrategy(
	  {passReqToCallback : true}, 
	  function(req, username, password, done) {
	    funct.localAuth(username, password)
	    .then(function (user) {
	      if (user) {
	        console.log("LOGGED IN AS: " + user.username);
	        req.session.success = 'You are successfully logged in ' + user.username + '!';
	        done(null, user);
	      }
	      if (!user) {
	        console.log("COULD NOT LOG IN");
	        req.session.error = 'Could not log user in. Please try again.'; 
	        done(null, user);
	      }
	    })
	    .fail(function (err){
	      console.log("ERROR signin: " + JSON.stringify(err));
	    });
	  }
	));

	passport.use('local-signup', new LocalStrategy(
	  {passReqToCallback : true},
	  function(req, username, password, done) {
	    funct.localReg(username, password)
	    .then(function (user) {
	      if (user) {
	        console.log("REGISTERED: " + user.username);
	        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
	        done(null, user);
	      }
	      if (!user) {
	        console.log("COULD NOT REGISTER");
	        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
	        done(null, user);
	      }
	    })
	    .fail(function (err){
	      console.log("ERROR signup: " + JSON.stringify(err));
	    });
	  }
	));
*/


}
