


var bcrypt = require('bcryptjs'),
    Q = require('q'),
    configDB = require('./database.js'),
    db = require('orchestrate')(configDB.db),
    models = require('./models.js');

localReg = function (deferred, username, password) {
  var hash = bcrypt.hashSync(password, 8);
  var user = new models.User()

  user.username = username;
  user.password = hash;
  user.avatar = "https://api.adorable.io/avatars/285/" + username + "@learningames.png";

  //check if username is already assigned in our database
  db.get('local-users', username)
  .then(function (result){ 
    console.log('username already exists');
    deferred.resolve(false); 
  })
  .fail(function (result) {
      if (result.body.message == 'The requested items could not be found.'){
        console.log('Username is free for use');
        db.put('local-users', username, user)
        .then(function () {
          console.log("USER: " + user);
          deferred.resolve(user);
        })
        .fail(function (err) {
          console.log("PUT FAIL:" + JSON.stringify(err));
          deferred.reject(new Error(err.body));
        });
      } else {
        deferred.reject(new Error(result.body));
      }
  });

  return deferred;
};

exports.localAuth = function (username, password) {
  var deferred = Q.defer();

  db.get('local-users', username)
  .then(function (result){
    var hash = result.body.password;
    if (bcrypt.compareSync(password, hash)) {
      deferred.resolve(result.body);
    } 
    else {
      console.log("PASSWORDS NOT MATCH");
      deferred.resolve(false);
    }
  }).fail(function (err){
    console.log('error: ' + JSON.stringify(err))
    if (err.body.message == 'The requested items could not be found.'){
      console.log("COULD NOT FIND USER IN DB FOR SIGNIN");
      deferred = localReg(deferred, username, password);
    } else {
      deferred.reject(new Error(err));
    }
  });

  return deferred.promise;
};

var testNum = 0;
exports.testAuth = function (user,done) {
  var user = new models.User();
  user.username = 'testuser_' + testNum++;
  user.avatar = "https://api.adorable.io/avatars/285/" + user.username + "@learningames.png";
  done(null, user);
};

exports.cameraAuth = function (user,done) {
    console.log('user', user.username);
  /*
  var user = new models.User();
  user.username = 'camerauser_' + cameraNum++;
  user.avatar = user.avatar;
  console.log('camerauser: ' + user);
  */
  done(null, user);
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
			var user = new models.User()
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

exports.facebookAuth = function (profile) {
	var deferred = Q.defer();

	db.search('local-users', "facebook.id==" + profile.id)
	.then(function (result){
		if(result.body.results.length){
		    console.log("FOUND USER " + result.body.results[0].value.username);
		    deferred.resolve(result.body.results[0].value);
		}
		else{
			var user = new User()

			user.username = profile.emails[0].value;
			user.password = '';
			user.avatar = profile.photos[0].value;
			user.facebook.id = profile.id;
			user.facebook.name = profile.displayName;
			user.facebook.email = profile.emails[0].value;

			console.log('USER NOT FOUND, go create a new one ' + JSON.stringify(user));
		    db.put('local-users', user.username, user )
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
