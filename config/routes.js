


function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        return next()
    }

    // if they aren't redirect them to the home page
    res.redirect("/")
}

//===============ROUTES===============
module.exports = function(app, passport){

	//displays our homepage
	app.get('/', function(req, res){
	    res.cookie('locale', res.getLocale(), { maxAge: 900000, httpOnly: false });
	    if (req.isAuthenticated()){
		  	res.redirect('/games');
	    }
	  	else{  		
		  	res.render('home', {user: req.user});
	  	}
	});

	/*
	//TEST
	app.get('/test', passport.authenticate('test-login', {
	  successRedirect: '/games/missinglet_er',
	  failureRedirect: '/'
	  })
	);
	*/
	app.get('/test', function(req, res){
		res.render('test',{layout: false});
	 });

	//CAMERA
	app.post('/cameraLogin', function(req, res, next) {
	    passport.authenticate('camera-login', function(err, user, info) {
	        if (err) { return next(err); }
	        if (!user) { return res.json('ko'); }
	        req.logIn(user, function(err) {
	            if (err) { return next(err); }
	            return res.json('ok');
	        });
	    })(req, res, next);
	});
	
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
	  res.cookie('locale', res.getLocale(), { maxAge: 900000, httpOnly: false });
	  res.locals.ingame = false;
	  res.render('games', {user: req.user});
	});

	//missing letter
	app.get('/games/missingletter', isLoggedIn, function(req, res){
	  res.locals.ingame = res.__('MissingLet_er');
	  res.render('missingletter', {user: req.user});
	});

	//missing number
	app.get('/games/missingnumber', isLoggedIn, function(req, res){
	  res.locals.ingame = res.__('MissingNumb3r');
	  res.render('missingnumber', {user: req.user});
	});

	//story chat
	app.get('/games/storychat', isLoggedIn, function(req, res){
	  res.locals.ingame = res.__('StoryChat');
	  res.render('storychat', {user: req.user});
	});


	// =====================================
	// 404 && offline
	// =====================================

	app.get('/offline', function(req,res){
		res.render('offline', {user: req.user});
	});

	app.get('*', isLoggedIn, function(req,res){
		res.redirect('/games');
	});
}