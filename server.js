


  var express = require('express'),
      exphbs = require('express-handlebars'),
      logger = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      methodOverride = require('method-override'),
      i18n = require('i18n'),
      //session = require('express-session'),
      session = require('cookie-session'),
      passport = require('passport'),
      socketIO = require('socket.io');

  var app = express();
  var port = process.env.PORT || 5000;
  var server = app.listen(port);
  var io = socketIO.listen(server);

  var missingletter = require('./games/missingletterServer.js');  
  var missingnumber = require('./games/missingnumberServer.js');  
  var storychat = require('./games/storychatServer.js');  

  console.log("listening on " + port + "!");

  //===============PASSPORT===============

  require('./config/passport')(passport);


  //===============EXPRESS================

  // Configure Express
  //app.use(logger('tiny'));
  app.use(express.static('public'));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({ extended: false, limit: '5mb' }));
  app.use(bodyParser.json());
  app.use(methodOverride('X-HTTP-Method-Override'));
  app.use(session({secret: 'hateosca', saveUninitialized: true, resave: true}));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(i18n.init);

  app.enable('trust proxy');

  app.use (function (req, res, next) {
    if (req.secure || req.headers.host.indexOf('localhost') == 0) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });

  // Session-persisted message middleware
  app.use(function(req, res, next){
    var err = req.session.error,
        msg = req.session.notice,
        success = req.session.success;

    delete req.session.error;
    delete req.session.success;
    delete req.session.notice;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
  });

  //i18n
  i18n.configure({
    locales: ['en', 'es'],
    autoReload: true,
    //defaultLocale: 'es',
    cookie: 'locale',
    directory: "" + __dirname + "/locales",
    register: [storychat, missingletter]
  });

  // Configure express to use handlebars templates
  var hbs = exphbs.create({
      defaultLayout: 'main', 
      helpers: {
        __: function () {
          return i18n.__.apply(this, arguments);
        },
        __n: function () {
          return i18n.__n.apply(this, arguments);
        }
      }
  });
  app.engine('handlebars', hbs.engine);
  app.set('view engine', 'handlebars');

  //===============ROUTES===============

  require('./config/routes.js')(app, passport);


  //===============TEST===============
  
  //var test = require('./testServer.js');  
  //test.init();

  //===============GAMES===============
  
  //MissingLet_er
  missingletter.init(io);

  //MissingNumb3r
  missingnumber.init(io);

  //StoryChat
  storychat.init(io);



