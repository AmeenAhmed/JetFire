var _ = require('underscore');
var orm = require('./orm');

exports.bootApplication = function(options) {
	// Initialize the app object
	jetpack.initApp(options.projectDir);

	// If port entry found then start with port else listen to 3000 by default
	var port = jetpack.util.getAppConfig(options.projectDir).port || 3000;

	console.log('Starting server in development mode @ localhost:' + port);

	// The database config from <app dir>/config/database.js
	var dbConfig = jetpack.util.getDbConfig(options.projectDir);

	// The app config from <app dir>/config/application.js
	var appConfig = jetpack.util.getAppConfig(options.projectDir);

	var env = appConfig.env;

	// Select the appropriate config for the current env
	var db = dbConfig[env];

	//Boot the ORM and initialize all the models
	orm.bootORM(db, env, options.projectDir);

	// Listen for any request from a client
	jetpack.app.all('*', function(req, res) {
		console.log('req = ' + req.url);

		// Route the request
		var route = jetpack.router.route(req, res, {
			projectDir: options.projectDir
		});

		// Get the routing params from the router
		var params = route.params;

		console.log(require('util').inspect(route));

		// The params object will contain query params for GET and
		// Form params from POST
		if(req.method == 'GET') {
			_.extend(params, req.query);
		} else if(req.method == 'POST') {
			_.extend(params, req.body);
		}

		// If a route is found for the current URL pass it to the dispatcher to dispatch
		if(route) {
			jetpack.dispatcher.dispatch(req, res, route, {
				projectDir: options.projectDir,
				params: route.params
			});	
		}
		
	});

	// Listen to for incoming requests
	jetpack.app.listen(port);
}
