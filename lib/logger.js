var colors = require('colors');

exports.error = function(error) {
	console.log('[Error]'.red + '\t ' + error);
}