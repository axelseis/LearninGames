


var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'), //config file contains all tokens and other private info
    db = require('orchestrate')(config.db); //config.db holds Orchestrate token

var User = function(){
	return {
		"username": '',
		"password": '',
		"avatar": '',
		"google": {
			"id": '',
			"name": '',
			"email": ''
		}		
	}
};

//used in local-signup strategy
exports.localReg = function (username, password) {
  var deferred = Q.defer();
  var hash = bcrypt.hashSync(password, 8);
  var user = new User()

  user.username = username;
  user.password = hash;
  user.avatar = "https://api.adorable.io/avatars/285/" + username + "@learningames.png";

  //check if username is already assigned in our database
  db.get('local-users', username)
  .then(function (result){ //case in which user already exists in db
    console.log('username already exists');
    deferred.resolve(false); //username already exists
  })
  .fail(function (result) {//case in which user does not already exist in db
      if (result.body.message == 'The requested items could not be found.'){
        console.log('Username is free for use');
        db.put('local-users', username, user)
        .then(function () {
          console.log("USER: " + user);
          deferred.resolve(user);
        })
        .fail(function (err) {
          console.log("PUT FAIL:" + err.body);
          deferred.reject(new Error(err.body));
        });
      } else {
        deferred.reject(new Error(result.body));
      }
  });

  return deferred.promise;
};

//check if user exists
    //if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
      //if password matches take into website
  //if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password) {
  var deferred = Q.defer();

  db.get('local-users', username)
  .then(function (result){
    console.log("FOUND USER");
    var hash = result.body.password;
    console.log(hash);
    console.log(bcrypt.compareSync(password, hash));
    if (bcrypt.compareSync(password, hash)) {
      deferred.resolve(result.body);
    } else {
      console.log("PASSWORDS NOT MATCH");
      deferred.resolve(false);
    }
  }).fail(function (err){
    if (err.body.message == 'The requested items could not be found.'){
          console.log("COULD NOT FIND USER IN DB FOR SIGNIN");
          deferred.resolve(false);
    } else {
      deferred.reject(new Error(err));
    }
  });

  return deferred.promise;
};

exports.googleAuth = function (profile) {
	var deferred = Q.defer();

	db.search('local-users', "google.id==" + profile.id)
	.then(function (result){
		if(result.body.results.length){
		    console.log("FOUND USER " + result.body.results[0].value.username);
		    deferred.resolve(result.body.results[0].value);
		}
		else{
			var user = new User()
			var data = profile._json;

			user.username = data.email;
			user.password = '';
			user.avatar = data.picture;
			user.google.id = data.id;
			user.google.name = data.name;
			user.google.email = data.email;

			console.log('USER NOT FOUND, go create a new one ' + JSON.stringify(user));
		    db.put('local-users', data.email, user )
		    .then(function () {
		      console.log("USER: " + user);
		      deferred.resolve(user);
		    })
		    .fail(function (err) {
		      console.log("PUT FAIL:" + err);
		      deferred.reject(new Error(err));
		    });
		}
	})
	.fail(function (err){
		console.log("Search Fail " + JSON.stringify(err));
		deferred.reject(new Error(err));
	});

	return deferred.promise;
};
            /*
            User.findOne({ 'google.id' : profile.id }, function(err, user) {
                if (err)
                    return done(err);

                if (user) {

                    // if a user is found, log them in
                    return done(null, user);
                } else {
                    // if the user isnt in our database, create a new user
                    var newUser          = new User();

                    // set all of the relevant information
                    newUser.google.id    = profile.id;
                    newUser.google.token = token;
                    newUser.google.name  = profile.displayName;
                    newUser.google.email = profile.emails[0].value; // pull the first email

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
            */
