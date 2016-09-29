


//===============ROUTES===============
module.exports = function(app, passport){

	//displays our homepage
	app.get('/', function(req, res){
	  res.render('home', {user: req.user});
	});

	//displays our signup page
	app.get('/signin', function(req, res){
	  res.render('signin');
	});

	//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
	app.post('/local-reg', passport.authenticate('local-signup', {
	  successRedirect: '/',
	  failureRedirect: '/signin'
	  })
	);

	//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
	app.post('/login', passport.authenticate('local-signin', {
	  successRedirect: '/',
	  failureRedirect: '/signin'
	  })
	);

	//logs user out of site, deleting them from the session, and returns to homepage
	app.get('/logout', function(req, res){
	  var name = req.user.username;
	  console.log("LOGGIN OUT " + req.user.username)
	  req.logout();
	  res.redirect('/');
	  req.session.notice = "You have successfully been logged out " + name + "!";
	});

	// =====================================
	// GOOGLE ROUTES =======================
	// =====================================
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback',
	  passport.authenticate('google', {
	    scope : ['profile'],
	    successRedirect : '/',
	    failureRedirect : '/signin'
	  })
	);

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
	    successRedirect : '/',
	    failureRedirect : '/signin'
	  })
	);

	// =====================================
	//GAMES ROUTES
	// =====================================

	//missing letter
	app.get('/game', function(req, res){
	  res.render('missingletter', {user: req.user});
	});
}