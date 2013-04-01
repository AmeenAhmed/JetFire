var fs = require('fs-extra');
var wrench = require('wrench');

/*
 *	Copy the app skeleton to the project folder, called by new app builder
 */

exports.createApp = function(projectDir, viewEngine) {
	wrench.copyDirSyncRecursive(jetpack.jetpackDir + '/skeletons/app', projectDir);
	
	fs.copy(jetpack.jetpackDir + '/skeletons/config/' + viewEngine + '_application.js',
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

/*
 *	Copy the controller skeleton
 */

exports.createController = function(projectDir, controllerName) {
	
	fs.copy(jetpack.jetpackDir + '/skeletons/controllers/controller.js',
		projectDir + '/app/controllers/' + controllerName + '.js', function(err) {
			if(err) {
				console.log(err);
			}
	});
		
};

/*
 *	Copy the model skeleton
 */

exports.createModel = function(projectDir, modelName) {

	modelName = require('inflection').camelize(modelName);

	fs.copy(jetpack.jetpackDir + '/skeletons/models/model.js',
		projectDir + '/app/models/' + modelName + '.js', function(err) { 
			if(err) {
				console.log(err);
			}		
	});
}

/*
 *	Copy the migration skeleton
 */

exports.createMigration = function(projectDir, modelName, attribs) {
	modelName = require('inflection').camelize(modelName);

	var migration = fs.readFileSync(jetpack.jetpackDir + '/skeletons/migrations/migration_create.js', 'utf-8');

	var attributes = '';

	console.log(typeof attribs);
	
	// Substitute the attributes in the template
	for(i=0; i<attribs.length; i++) {
		var temp = attribs[i].split(':');

		attributes += temp[0] + ': \'' + temp[1] + '\',\n\t\t\t'; 

	}

	var migrationFile = migration.replace(/\$modelName/g, '\'' + modelName + '\'').
						replace(/\$attributes/g, attributes);


	fs.outputFileSync(projectDir + '/db/migrate/' + jetpack.util.getTimestamp() + '_' + 'Create' + 
		modelName + '.js', migrationFile);
}

/*
 *	Copy the schema skeleton
 */

exports.createSchema = function(projectDir, modelName, attribs) {
	modelName = require('inflection').camelize(modelName);

	var schema = fs.readFileSync(jetpack.jetpackDir + '/skeletons/models/schema.js', 'utf-8');

	var attributes = '';

	// Substitute the attributes in the template
	for(i=0; i<attribs.length; i++) {
		var temp = attribs[i].split(':');

		attributes += temp[0] + ': \'' + temp[1] + '\',\n\t\t\t'; 

	}

	var schemaFile = schema.replace(/\$attributes/g, attributes);


	fs.outputFileSync(projectDir + '/db/schemas/' + modelName + 'Schema' +
		'.js', schemaFile);
}