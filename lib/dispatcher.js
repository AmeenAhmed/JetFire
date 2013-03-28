var inflection = require('inflection');


exports.dispatch = function(req, res, route, options) {
	var controllerName = inflection.camelize(route.controller) + 'Controller';
	var controller = jetpack.util.getController(options.projectDir, controllerName);

	console.log('controller name:' + controllerName);

	if(controller.err) {
		res.end('Dispatcher: ' + controller.err.message);
	} else {
		var c = executeCA(controller, route, options.params);	
		if(c.err) {
			res.end('Dispatcher: ' + c.err.message);
		} else {
			dispatchView(res, route, c, options);
		}
	}
	
	
	res.end('wait...');
}


function executeCA(controller, route, _params) {
	 
	if(controller[route.action]) {
		var $ = {
			params: _params
		};

		controller[route.action]($,function() {
			console.log('Now dispatch view!');
		});
		console.log('$ : ' + jetpack.util.inspect($));
		return {
			$: $
		};

	} else {
		return {
			err: jetpack.constants.NO_ACTION
		}
	}

} 

function dispatchView(res, route, c, options) {
	var viewEngine = jetpack.util.getAppConfig(options.projectDir).viewEngine;

	var view = jetpack.util.getView(options.projectDir, route, viewEngine);

	if(view.err) {
		res.end(view.err.message);
	} else {
		res.end(preprocessView(view, viewEngine, c));
	}

	console.log(jetpack.util.inspect(view));

	res.end('Dispatching view...');
}

function preprocessView(view, _viewEngine, c) {
	console.log(jetpack.util.inspect(c));

	var viewEngine = require(_viewEngine);
	if(_viewEngine == 'jade') {
		var fn = viewEngine.compile(view.layout, {});
		var viewCode = viewEngine.compile(view.view, {})(c);
		return fn({
			$: c.$,
			yield_view: viewCode
		});

	} else if(_viewEngine == 'ejs') {
		var viewCode = viewEngine.render(view.view, {
			$: c.$
		});
		return viewEngine.render(view.layout, {
			yield_view: viewCode,
			$: c.$
		})
	} else if(_viewEngine == 'haml') {
		var viewCode = viewEngine(view.view);
		return viewEngine(view.layout)({
			yield_view: viewCode(c),
			$: c.$
		});
	}
	
}