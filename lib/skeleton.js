var fs = require('fs');
var wrench = require('wrench');

exports.createApp = function(projectDir, viewEngine) {
	wrench.copyDirSyncRecursive(jetpack.jetpackDir + '/skeletons/app', projectDir);
	
	fs.writeFileSync(projectDir + '/config/application.js',
		fs.readFileSync(jetpack.jetpackDir + '/skeletons/config/' 
			+ viewEngine + '_application.js', 'utf-8'));
	fs.writeFileSync(projectDir + '/app/views/layouts/application_layout.' + viewEngine,
		fs.readFileSync(jetpack.jetpackDir + '/skeletons/layouts/application_layout.' 
			+ viewEngine, 'utf-8'));
};

exports.createController = function(projectDir, controllerName) {
	
	fs.writeFileSync(projectDir + '/app/controllers/' + controllerName + '.js',
		fs.readFileSync(jetpack.jetpackDir + '/skeletons/controllers/controller.js'));
};