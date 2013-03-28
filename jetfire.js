#!/usr/bin/env node

// Requires
var skeleton = require('./lib/skeleton');
var exceptions = require('./lib/exceptions');
var logger = require('./lib/logger');
var cli = require('./lib/cli');
var util = require('./lib/util');
var router = require('./lib/router');
var constants = require('./lib/constants');
var dispatcher = require('./lib/dispatcher');

var express = require('express');


var app = new express();


// Global namespace object 'jetpack'
var jetpack = {
	jetpackDir: __dirname,
	skeleton: skeleton,
	exceptions: exceptions,
	log: logger,
	express: express,
	app: app,
	util: util,
	router: router,
	dispatcher: dispatcher,
	constants: constants
};

global['jetpack'] = jetpack;

jetpack.initApp = function(appDir) {
	jetpack.app.use(express.static(appDir + '/public'));
	app.use(express.cookieParser()); 
	app.use(express.session({cookie: { path: '/', httpOnly: true}, secret:'eeuqram'}));
	app.use(express.bodyParser());
};

// Call the cli process with the first arg passed to the jetpack CLI tool.
(function() {
	console.log('arg : ' + process.argv[2]);
	cli[process.argv[2]]();
})();





