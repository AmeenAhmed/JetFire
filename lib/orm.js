var sequelize = require('sequelize');
var _ = require('underscore');

/*
 *	Boot the orm and initialize all the models in the app
 */
exports.bootORM = function(dbConfig, env, projectDir) {

	// Get the storage option for sequelize from the db config file for sqlite
	var _storage = projectDir + '/' + 
					((dbConfig.adapter == 'sqlite') ? dbConfig.database : null);

	// If the adapter is not sqlite then get the host
	var _host = (dbConfig.adapter != 'sqlite') ?
				dbConfig.database.split(':')[0] :
				null;
	// If the adapter is not sqlite then get the port
	var _port = (dbConfig.adapter != 'sqlite') ?
				dbConfig.database.split(':')[1] :
				null;

	console.log({
		dialect: dbConfig.adapter,

		storage: _storage,

		host: _host,

		post: _port,

		maxConcurrentQueries: 100,

		pool: dbConfig.pool
	});

	// Initialize sequelize
	var db = new sequelize(env, env, null, {
		dialect: dbConfig.adapter,

		storage: _storage,

		host: _host,

		post: _port,

		maxConcurrentQueries: 100,

		pool: dbConfig.pool
	});

	// Put sequelize in the jetpack namespace
	jetpack.sql = sequelize;
	jetpack.db = db;

	// Initialize the models
	bootModels(projectDir);
}

/*
 *	Initialize models and add the models to the global Scope
 */
function bootModels(projectDir) {
	var db = jetpack.db;
	var sql = jetpack.sql;

	var Tables = db.define('__table', {
		tableName: sql.STRING
	});

	// Get all the tables in the app.
	Tables.findAll().success(function(rows) {
		// Iterate through each table and create a model
		_.each(rows, function(row) {
			var tableName = row.tableName;

			var model = require(projectDir + '/app/models/' + tableName);

			var validations = {};
			var classMethods = {};
			var instanceMethods = {};

			// The object passed to a model which contains functions to create validations
			// and define class and instance methods
			var mdl = {
				validates: function(attrib, vals) {
					console.log('called for ' + attrib);
					validations[attrib] = vals;
				},
				define: function(name, func) {
					if(name.substr(0,1) == '@') {
						instanceMethods[name.substr(1,name.length-1)] = func;
					} else {
						classMethods[name] = func;
					}
				}
			}

			// Call the model definition function
			model(mdl);

			console.log(validations);
			console.log(classMethods);
			console.log(instanceMethods);

			var schemaDoc = {};

			// Get the model's schema
			var schema = require(projectDir + '/db/schemas/' + tableName + 'Schema');

			// Construct the model definition object to be passed to sequelize
			for(var attrib in schema) {
				if(validations[attrib]) {
					schemaDoc[attrib] = {
						type: sql[schema[attrib].toUpperCase()],
						validate: validations[attrib]
					};
				} else {
					schemaDoc[attrib] = sql[schema[attrib].toUpperCase()];
				}
			}

			console.log(schemaDoc);

			// Get the modelName
			var modelName = require('inflection').camelize(row.tableName);

			// Create the model and put it in global scope
			global[modelName] = db.define(tableName, schemaDoc, {
				classMethods: classMethods,
				instanceMethods: instanceMethods
			});

		});	
	})
}






