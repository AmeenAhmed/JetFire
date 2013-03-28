/*
 *	Router.js
 *	
 */

function preprocessRoutes(projectDir) {
	// 'project/:id/users/:uid'

	var routes = jetpack.util.getRoutes(projectDir);

	for(var route in route) {
		if(route.match(':')) {
			var components = route.split('/');

			for(var i=0; i<components.length; i++) {
				var el = components.match(':[a-zA-Z0-9]*');
				var params = {};
				var newUrl = '';
				if(el) {
					newUrl += el
				}
			}
		}
	}
}

exports.route = function(req, res, options) {
	// Replace the leading slash if not only '/'
	var url = req.url.replace('/', '') || '/';

	console.log('method : ' + req.method);

	var route = getRoute(url, req.method, options.projectDir);
	console.log('route : ' + require('util').inspect(route));
	if(route.err) {
		res.end(route.err.message);
		return false;
	} else {
		return route;
	}
	
}

function getRoute(url, method, projectDir) {
	var routeObj = {};

	var routes = jetpack.util.getRoutes(projectDir);

	// If the route definition for this url exists
	if(routes[url]) {
		// If the value is an object
		if(typeof routes[url] == 'string') {
			return routeFromString(routes[url]);
		}

		if(typeof routes[url] == 'object') {
			return routeFromObject(routes[url], method);
		}

	} else {

		if(routes)

		return {
			err: jetpack.constants.NO_ROUTE
		}
	}

	return routeObj;
}

function routeFromString(str) {
	var obj = {};

	// If the value does not contain a hash ('#') then it is a malformed route definition
	if(!str.match('#')) {
		return false;
	}

	obj.controller = str.split('#')[0];
	obj.action = str.split('#')[1];

	// Return the object with controller and route if both exist else return false
	return obj.controller && obj.action ? obj : {
		err: jetpack.constants.MALFORMED_ROUTE
	};
}

function routeFromObject(obj, _method) {
	var routeObj = {};
	var method = _method.toLowerCase();
	// If a match is found check via if the current method exists for the route
	// If the via param is not found then it accepts both GET & POST
	if(obj.match) {
		if(obj.via) {
			// If the current method exists then route it
			if(obj.via.match(method)) {
				return routeFromString(obj.match);
			} else {
				return {
					err: jetpack.constants.NO_ROUTE
				};
			}
		} else {
			return routeFromString(obj.match);
		}
	} else if(obj[method]) {
		return routeFromString(obj[method]);
	} else {
		return  {
			err: jetpack.constants.MALFORMED_ROUTE
		};
	}
	return obj;
}




