


function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next()

    // if they aren't redirect them to the home page
    res.redirect("/")
}

//===============ROUTES===============
module.exports = function(app, passport){

	//displays our homepage
	app.get('/', function(req, res){
	  res.render('home', {user: req.user});
	});

	//TEST
	app.get('/test', passport.authenticate('test-login', {
	  successRedirect: '/games/missinglet_er',
	  failureRedirect: '/'
	  })
	);

	/*
	//displays our signup page
	app.get('/signin', function(req, res){
	  res.render('signin');
	});
	*/

	//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
	app.post('/local-reg', passport.authenticate('local-signup', {
	  successRedirect: '/games',
	  failureRedirect: '/signin'
	  })
	);

	//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
	app.post('/login', passport.authenticate('local-signin', {
	  successRedirect: '/games',
	  failureRedirect: '/'
	  })
	);

	//logs user out of site, deleting them from the session, and returns to homepage
	app.get('/logout', function(req, res){
	  var name = req.user.username;
	  console.log("LOGGIN OUT " + req.user.username)
	  req.logout();
	  req.session.notice = "You have successfully been logged out " + name + "!";
	  res.redirect('/');
	});

	// =====================================
	// GOOGLE ROUTES =======================
	// =====================================
	app.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback',
	  passport.authenticate('google', {
	    scope : ['profile'],
	    successRedirect : '/games',
	    failureRedirect : '/'
	  })
	);

	// =====================================
	// FACEBOOK ROUTES =====================
	// =====================================
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : ['email'] }));

	// the callback after google has authenticated the user
	app.get('/auth/facebook/callback',
	  passport.authenticate('facebook', {
	    successRedirect : '/games',
	    failureRedirect : '/'
	  })
	);

	// =====================================
	// GAMES ROUTES
	// =====================================

	app.get('/games', isLoggedIn, function(req, res){
	  res.locals.ingame = null;
	  res.render('games', {user: req.user});
	});

	//missing letter
	app.get('/games/missinglet_er', isLoggedIn, function(req, res){
	  res.locals.ingame = 'MissingLet_er';
	  res.render('missinglet_er', {user: req.user});
	});


	// =====================================
	// 404
	// =====================================

	app.get('*', isLoggedIn, function(req,res){
		res.redirect('/games');
	});


}