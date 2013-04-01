var fs = require('fs');
var skeleton = require('./skeleton');
var _ = require('underscore');
var boot = require('./bootstrap');
var sql = require('sequelize');

// The current project directory
var __projectDir = process.cwd();

/* 
 * 	Handler for creating a new application
 * 	jetpack new <app-name>
 */

var newHandler = function() {

	console.log('Creating a new App...');

	var appName = process.argv[3];

	// If a view engine is specified create the application with the settings for
	// that particular engine
	var viewEngine = process.argv[4] && process.argv[4].replace('-', '') || 'jade';

	// Create the skeleton of the application
	skeleton.createApp(__projectDir + '/' + appName, viewEngine);

	// Initialize sequelize and add the meta data for the application
	sq = new sql('development', 'development', null, {
		dialect: 'sqlite',
		storage: __projectDir + '/' + appName + '/db/development.sqlite3'
	});

	console.log('sql object Created!');

	// Tables table which will contain the list of db tables in the app.
	var Tables = sq.define('__table', {
		tableName: sql.STRING
	});	

	// Migrations table which will contain the current migration timestamp.
	var migrations = sq.define('__migration', {
		currentMigration: sql.STRING
	});

	// Sync the created models to the db
	sq.sync({force:true}).success(function() {
		migrations.create({
			currentMigration: '0'
		});
	}).error(function(err) {
		console.log('Error : ' + err);
	});
};

/* 
 *	Handler for starting the server
 */
var serverHandler = function() {	
	boot.bootApplication({
		projectDir: __projectDir
	});
}

/* 
 *	Handler for the generate command
 *	
 *	jetpack generate/g controller / model
 */
var  generateHandler = function() {

	// The gens object contains the handlers for individual objects
	var gens = {
		// Controller generator
		'controller': function() {
			// Name of the controller to be created
			var name = process.argv[4];

			var inflection = require('inflection');

			// Camelize the controller name, 'home' => 'Home'
			name = inflection.camelize(name) + 'Controller';

			// Create the skeleton of the controller
			skeleton.createController(__projectDir, name);
		},
		'model': function() {
			// Name of the model to be created
			var name = process.argv[4];

			// Attributes for the model
			var attribs = process.argv.slice(5);

			// Create the skeleton for the model
			skeleton.createModel(__projectDir, name);

			// Create the skeleton for the migration to create the table for this model
			skeleton.createMigration(__projectDir, name, attribs);

			// Create the Schema for the db table
			skeleton.createSchema(__projectDir, name, attribs);

			sq = new sql('development', 'development', null, {
				dialect: 'sqlite',
				storage: __projectDir  + '/db/development.sqlite3'
			});

			// Add the table to the meta data __tables
			var Tables = sq.define('__table', {
				tableName: sql.STRING
			});

			Tables.create({tableName: name});

		}
	}

	// Call the appropriate generator
	gens[process.argv[3]]();
}

/*
 *	Handler for the db:migrate & db:rollback commands
 */

var migrationHandler = function() {

	// Get the list of all migartions
	var list = fs.readdirSync(__projectDir + '/db/migrate/');

	var toMigrate = [];

	sq = new sql('development', 'development', null, {
		dialect: 'sqlite',
		storage: __projectDir  + '/db/development.sqlite3'
	});

	var migrations = sq.define('__migration', {
		currentMigration: sql.STRING
	});

	// Get the rows in the __migrations meta data table
	migrations.findAll().success(function(rows) {

		// Get the current migration timestamp
		var currentMigration = parseInt(rows[0].currentMigration);

		// Iterate through all the migartions in the app and create a list
		// toMigrate with the migrations which are to be run
		_.each(list, function(item) {

			// Get the timestamp from the migration file
			var ts = item.match(/^[0-9]+/i)[0];

			// Check if this migration's timestamp is newer than the currentMigration
			// in the meta data
			if(parseInt(ts) > currentMigration) {
				toMigrate.push(item);
			}
		});

		// Sort the list of the migrations to be run
		var sortedList = _.sortBy(toMigrate, function(num) {
			return parseInt(num);
		});

		console.log(sortedList);

		// If the command is db:migrate then take the migrations and call the up method
		if(process.argv[2] == 'db:migrate') {
			_.each(sortedList, function(ts) {
				// Get the migration file
				var migration = require(__projectDir + '/db/migrate/' + ts);

				// The object which has the methods which are called from the migrations
				var db = {
					createTable: function(name, attribs) {
						var model = sq.define(name, attribs);
						model.sync();
					},

					dropTable: function(name) {
						var model = sq.define(name, attribs);
						model.drop();
					}
				}

				// Call the migrations up method
				migration.up(db);
				
				// Set this migration's timestamp as the currentTimestamp in the
				// meta data
				migrations.findAll({id: rows[0].id}).success(function(_rows) {
					_rows[0].currentMigration = ts.match(/^[0-9]+/i)[0];
					_rows[0].save();
				});
			});


		} else if(process.argv[2] == 'db:rollback') {	// If command is db:rollback
			var toRollback = [];

			// Iterate through the list of all migrations and take only the migrations
			// which are older or the current migration
			_.each(list, function(item) {
				var ts = item.match(/^[0-9]+/i)[0];
				if(parseInt(ts) <= currentMigration) {
					toRollback.push(item);
				}
			});

			// Sort the list
			toRollback = _.sortBy(toRollback, function(num) {
				return parseInt(num);
			});

			// Reverse the list of all migrations and revert them one by one
			// newer to older
			toRollback = toRollback.reverse();

			console.log(toRollback);
			console.log(currentMigration);

			// Check if the command had a step=? param, if so take the step else set to 1
			// by default
			var step = (!!process.argv[3]) ? parseInt(process.argv[3].replace(/^step=/g,'')) 
						: 1 ;

			console.log(step);

			// Iterate through the list of all migrations to rollback and call the down method
			for(var i=0; i<step && toRollback.length > 0; i++) {
				// get the migration
				var migration = require(__projectDir + '/db/migrate/' + toRollback[i]);

				// The object which contains the methods which are called from the migration
				// TODO: Make the below code DRY
				var db = {
					createTable: function(name, attribs) {
						var model = sq.define(name, attribs);
						model.sync();
					},

					dropTable: function(name) {
						var model = sq.define(name,{});
						model.drop();
					}
				}

				// Call the down method
				migration.down(db);

				// Set the currentMigration in the meta data to the previous migration's
				// timestamp
				(function(ts) {
					migrations.findAll({id: rows[0].id}).success(function(_rows) {

						_rows[0].currentMigration = (!!ts) ?
								ts.match(/^[0-9]+/i)[0] : 0;

						_rows[0].save();
					});	
				})(toRollback[i+1]);
					
			}
			
		}
	});
}

// Object with all the handlers
module.exports = {
	'new': newHandler,
	'server': serverHandler,
	's': serverHandler,
	'generate': generateHandler,
	'g': generateHandler,
	'db:migrate': migrationHandler,
	'db:rollback': migrationHandler
}


