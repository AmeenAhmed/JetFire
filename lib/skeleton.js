var fs = require('fs');
var wrench = require('wrench');

exports.createApp = function(projectDir, viewEngine) {
	wrench.copyDirSyncRecursive(jetpack.jetpackDir + '/skeletons/app', projectDir);
	fs.linkSync('./skeletons/layouts/application_layout.' + viewEngine,
			projectDir + '/app/views/layouts/application_layout.' + viewEngine);
	fs.linkSync('./skeletons/config/' + viewEngine + '_application.js',
			projectDir + '/config/application.js');
};

exports.createController = function(projectDir, controllerName) {
	fs.linkSync(jetpack.jetpackDir + '/skeletons/controllers/controller.js',
				projectDir + '/app/controllers/' + controllerName + '.js');
};