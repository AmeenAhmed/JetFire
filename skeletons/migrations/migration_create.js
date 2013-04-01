module.exports = {
	up: function(db) {
		db.createTable($modelName, {
			$attributes
		});
	},

	down: function(db) {
		db.dropTable($modelName);
	}
}