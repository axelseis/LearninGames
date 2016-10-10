/**
 * Author: Axel claver <axelseis@gmail.com>
 * License: MIT
 */
"use strict";

var passport = require('passport'), 
	util = require('util'),
	fs = require('fs');

var usersNum = 0;

function StrategyCamera(options, verify) {
	this.name = 'camera';
	this.passAuthentication = options.passAuthentication || true;
	this.userId = options.userId || 1;
	this.verify = verify;
}

util.inherits(StrategyCamera, passport.Strategy);

StrategyCamera.prototype.authenticate = function authenticate(req) {
	if (this.passAuthentication) {
		var username = 'camerauser_' + usersNum++;
		var filename = '/users/' + username + '.png';

		fs.writeFile('public' + filename, req.body.avatar.replace(/^data:image\/png;base64,/, ""), 'base64', function(err){
            if (err) throw err
            console.log('File saved.')
        })
		var user = {
			username: username,
			avatar: filename
		}, 
		self = this;
		this.verify(user, function(err, resident) {
			if(err) {
				self.fail(err);
			} 
			else {
				self.success(resident);
			}
		});
	} 
	else {
		this.fail('Unauthorized');
	}
}

module.exports = StrategyCamera;