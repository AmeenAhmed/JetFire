var inflection = require('inflection');

/*
 *	After routing executes the controller code and renders the view 
 */
exports.dispatch = function(req, res, route, options) {
	// Get the controller name 
	var controllerName = inflection.camelize(route.controller) + 'Controller';

	// Get the controller
	var controller = jetpack.util.getController(options.projectDir, controllerName);

	console.log('controller name:' + controllerName);

	// If the controller was not found the return an error
	if(controller.err) {
		res.end('Dispatcher: ' + controller.err.message);
	} else {
		// Execute the action
		var c = executeCA(controller, route, options.params, function(obj) {
			dispatchView(res, route, obj, options);		
		});
		// If error returned, return the error
		if(c && c.err) {
			res.end('Dispatcher: ' + c.err.message);
		}
	}
}

/*
 *	Execute the action
 */

function executeCA(controller, route, _params, dispatchNow) {
	// If the action exists
	if(controller[route.action]) {

		// $ object which contains params and other data
		var $ = {
			params: _params
		};

		// Execute the action and pass the next() method which is called from the controller
		// to trigger the render
		controller[route.action]($,function() {
			// Dispatch the view with template variables got from the controller
			dispatchNow({
				$: $
			});
		});
		console.log('$ : ' + jetpack.util.inspect($));
		
	// Else return an error
	} else {
		return {
			err: jetpack.constants.NO_ACTION
		}
	}

} 

/*
 *	Dispatch and render the view
 */
function dispatchView(res, route, c, options) {
	// Get the view engine setting of this application
	var viewEngine = jetpack.util.getAppConfig(options.projectDir).viewEngine;

	// Get the view file
	var view = jetpack.util.getView(options.projectDir, route, viewEngine);

	// If error return error
	if(view.err) {
		res.end(view.err.message);
	} else {
		// Preprocess the view and render it
		res.end(preprocessView(view, viewEngine, c));
	}
	console.log(jetpack.util.inspect(view));
}

/*
 *	Compile the templates into html
 */
function preprocessView(view, _viewEngine, c) {
	console.log(jetpack.util.inspect(c));

	var viewEngine = require(_viewEngine);

	// If the render engine is jade compile jade
	if(_viewEngine == 'jade') {
		var fn = viewEngine.compile(view.layout, {});
		var viewCode = viewEngine.compile(view.view, {})(c);
		return fn({
			$: c.$,
			yield_view: viewCode
		});

	// If the render engine is ejs compile ejs
	} else if(_viewEngine == 'ejs') {
		var viewCode = viewEngine.render(view.view, {
			$: c.$
		});
		return viewEngine.render(view.layout, {
			yield_view: viewCode,
			$: c.$
		})
	// If the render engine is haml compile haml
	} else if(_viewEngine == 'haml') {
		var viewCode = viewEngine(view.view);
		return viewEngine(view.layout)({
			yield_view: viewCode(c),
			$: c.$
		});
	}
	
}