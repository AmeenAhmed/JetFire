/*
 *	Router.js
 *	
 */
var _ = require('underscore');

function checkInWildCardRoutes(projectDir, url) {
	// 'project/:id/users/:uid'

	var routes = jetpack.util.getRoutes(projectDir);

	console.log('calling checkInWildCardRoutes');
	

	for(var route in routes) {
		if(route.match(':')) {
			console.log('Found wild card route : ' + route);
			var routeComponents = route.split('/');
			var urlComponents = url.replace(/\?[a-zA-Z0-9=+&]*/, '').split('/');
			if(urlComponents.length != routeComponents.length) {
				return null;
			}
			console.log(routeComponents);
			console.log(urlComponents);
			var routeMatches = true;
			var variables = {};
			for(var i=0; i<routeComponents.length; i++) {
				var el = routeComponents[i];
				console.log('checking if ' + urlComponents[i] + ' == ' + routeComponents[i] +
							 ':' + urlComponents[i] == routeComponents[i]);

				if(el.match(':')) {
					var variable = el.replace(':', '');
					variables[variable] = urlComponents[i];
					console.log('var ' + variable + ' = ' + urlComponents[i]);
					continue;
				}
				if(urlComponents[i] != routeComponents[i]) {
					routeMacthes = false;
					console.log('Route does not match with url');
					break;
				}
			}
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
	var params = {};
	// If the route definition for this url exists
	if(routes[url]) {
		// If the value is an object
		if(typeof routes[url] == 'string') {
			var obj = routeFromString(routes[url]);
			obj.params = params;
			return obj;
		}

		if(typeof routes[url] == 'object') {
			var obj = routeFromObject(routes[url], method);
			obj.params = params;
			return obj;
		}

	} else {

		var route = checkInWildCardRoutes(projectDir, url);
		if(route) {
			console.log(jetpack.util.inspect(route));
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




