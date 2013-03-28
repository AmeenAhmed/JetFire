var skeleton = require('./skeleton');


var __projectDir = process.cwd();


var newHandler = function() {

	console.log('Creating a new App...');

	var appName = process.argv[3];

	var viewEngine = process.argv[4].replace('-', '') || 'jade';

	skeleton.createApp(__projectDir + '/' + appName, viewEngine);

};

var serverHandler = function() {	
	// Initialize the app object
	jetpack.initApp(__projectDir);

	// If port entry found then start with port else listen to 3000 by default
	var port = jetpack.util.getAppConfig(__projectDir).port || 3000;

	console.log('Starting server in development mode @ localhost:' + port);

	jetpack.app.all('*', function(req, res) {
		console.log('req = ' + req.url);
		var route = jetpack.router.route(req, res, {
			projectDir: __projectDir
		});
		console.log(require('util').inspect(route));
		if(route) {
			jetpack.dispatcher.dispatch(req, res, route, {
				projectDir: __projectDir,
				params: route.params
			});	
		}
		
	});

	jetpack.app.listen(port);
}

module.exports = {
	'new': newHandler,
	'server': serverHandler,
	's': serverHandler
}


