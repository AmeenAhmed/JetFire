var fs = require('fs');
var wrench = require('wrench');

exports.createApp = function(projectDir, viewEngine) {
	wrench.copyDirSyncRecursive(jetpack.jetpackDir + '/skeletons/app', projectDir);
	fs.linkSync(jetpack.jetpackDir + '/skeletons/layouts/application_layout.' + viewEngine,
			projectDir + '/app/views/layouts/application_layout.' + viewEngine);
	fs.linkSync(jetpack.jetpackDir + '/skeletons/config/' + viewEngine + '_application.js',
			projectDir + '/config/application.js');
}