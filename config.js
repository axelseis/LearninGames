


module.exports = {
  	"db": "bb7af0df-3c53-4c9c-b074-54689e372bb6",

	'facebookAuth' : {
	    'clientID'      : 'your-secret-clientID-here', // your App ID
	    'clientSecret'  : 'your-client-secret-here', // your App Secret
	    'callbackURL'   : 'http://localhost:8080/auth/facebook/callback'
	},

	'twitterAuth' : {
	    'consumerKey'       : 'your-consumer-key-here',
	    'consumerSecret'    : 'your-client-secret-here',
	    'callbackURL'       : 'http://localhost:8080/auth/twitter/callback'
	},

	'googleAuth' : {
	    'clientID'      : '425680065060-1dh4c8m6e7fdnmuont6d44ujjru6nn5c.apps.googleusercontent.com',
	    'clientSecret'  : 'PooRP8a8BIYEJV5YWz2bSpy-',
	    'callbackURL'   : '/auth/google/callback'
	}
}