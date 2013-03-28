var fs = require('fs-extra');
var wrench = require('wrench');

exports.createApp = function(projectDir, viewEngine) {
	wrench.copyDirSyncRecursive(jetpack.jetpackDir + '/skeletons/app', projectDir);
	
	fs.copy(jetpack.jetpackDir + '/skeletons/config/' + viewEngine + '_application.js', 'utf-8',
		projectDir + '/config/application.js', function(err) {
			if(err) {
				console.log(err);
			}
		});
	
	fs.copy(jetpack.jetpackDir + '/skeletons/layouts/application_layout.' + viewEngine,
		projectDir + '/app/views/layouts/application_layout.' + viewEngine, function(err) {
			if(err) {
				console.log(err);
			}
		});
	
};

exports.createController = function(projectDir, controllerName) {
	
	fs.writeFileSync(projectDir + '/app/controllers/' + controllerName + '.js',
		fs.readFileSync(jetpack.jetpackDir + '/skeletons/controllers/controller.js'));
};