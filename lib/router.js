/*
 *	Router.js
 *	
 */
var _ = require('underscore');

/*
 *	Take a url and check if the route exists in wildcarded routes
 */
function checkInWildCardRoutes(projectDir, url) {
	// 'project/:id/users/:uid'

	// Get the routes object
	var routes = jetpack.util.getRoutes(projectDir);

	console.log('calling checkInWildCardRoutes');
	
	// Iterate through the routes and check all the wildcarded routes
	for(var route in routes) {
		// If the route has ':'
		if(route.match(':')) {
			console.log('Found wild card route : ' + route);

			// Split indidual route components
			var routeComponents = route.split('/');

			// Split indidual url components
			var urlComponents = url.replace(/\?[a-zA-Z0-9=+&]*/, '').split('/');

			// IF both don't match then go to the next route
			if(urlComponents.length != routeComponents.length) {
				continue;
			}

			console.log(routeComponents);
			console.log(urlComponents);

			var routeMatches = true;
			var variables = {};

			// Iterate through the individual route components and check if they match
			for(var i=0; i<routeComponents.length; i++) {

				var el = routeComponents[i];

				console.log('checking if ' + urlComponents[i] + ' == ' + routeComponents[i] +
							 ':' + urlComponents[i] == routeComponents[i]);
				// If a ':' is found in the route then take the param from the url
				if(el.match(':')) {
					var variable = el.replace(':', '');
					variables[variable] = urlComponents[i];
					console.log('var ' + variable + ' = ' + urlComponents[i]);
					continue;
				}
				// If the url component does not match with the route component then return
				if(urlComponents[i] != routeComponents[i]) {
					routeMacthes = false;
					console.log('Route does not match with url');
					break;
				}
			}
			// If all is well then return the matched route
			if(routeMatches) {
				return {
					vars: variables,
					CA: routes[route] 
				};
			}
		}
	}
	return null;
}

/* 
 *	route function which routes the request
 */
exports.route = function(req, res, options) {
	// Replace the leading slash if not only '/'
	var url = req.url.replace('/', '') || '/';

	console.log('method : ' + req.method);

	// Get the routes file from the app
	var route = getRoute(url, req.method, options.projectDir);

	console.log('route : ' + require('util').inspect(route));

	// If routing error then return the error
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
	var params = {};
	// If the route definition for this url exists
	if(routes[url]) {
		// If the value is a string
		if(typeof routes[url] == 'string') {
			var obj = routeFromString(routes[url]);
			obj.params = params;
			return obj;
		}
		// If the value is an object
		if(typeof routes[url] == 'object') {
			var obj = routeFromObject(routes[url], method);
			obj.params = params;
			return obj;
		}

	} else {
		// if all else fails check in wildcarded routes
		var route = checkInWildCardRoutes(projectDir, url);
		if(route) {
			console.log(jetpack.util.inspect(route));
			// Again do the same thing
			if(typeof route.CA == 'string') {
				var obj = routeFromString(route.CA, method);		
				obj.params = _.extend(params, route.vars);
				return obj;
			}
			if(typeof route.CA == 'object') {
				var obj = routeFromObject(route.CA, method);
				obj.params = _.extend(params, route.vars);
				return obj;
			}
		} else {
			// If not found return error
			return {
				err: jetpack.constants.NO_ROUTE
			}	
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




