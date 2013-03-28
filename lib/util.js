/*
 *	File : Util.js
 *
 *	Author: Ameen Ahmed <ameen.ahmed.b@gmail.com>
 *
 *	Desc : Utility functions and helpers	
 */


/*
 *	retreive the file <app path>/config/application.js
 */

var fs = require('fs');

exports.getAppConfig = function(rootDir) {
	return require(rootDir + '/config/application.js');
};

/*
 *	retrive the file <app path>/config/routes.js
 */
exports.getRoutes = function(rootDir) {
	return require(rootDir + '/config/routes.js');	
};

exports.getController = function(rootDir, controller) {
	if(fs.existsSync(rootDir + '/app/controllers/' + controller + '.js')) {
		return require(rootDir + '/app/controllers/' + controller + '.js');	
	} else {
		return {
			err: jetpack.constants.NO_CONTROLLER
		}
	}
	
};

exports.getView = function(rootDir, route, viewEngine) {
	var viewFileName = rootDir + '/app/views/' + route.controller 
		+ '/' + route.action + '.' + viewEngine;
	var layout = rootDir + '/app/views/layouts/application_layout.' + viewEngine;
	console.log(viewFileName);
	console.log(layout);
	if(fs.existsSync(viewFileName) && fs.existsSync(layout)) {
		return {
			view: fs.readFileSync(viewFileName, 'utf-8'),
			layout: fs.readFileSync(layout, 'utf-8'),
			engine: viewEngine
		}
	} else {
		return {
			err: jetpack.constants.NO_VIEW
		};
	}
}

exports.inspect = function(obj) {
	return require('util').inspect(obj);
};