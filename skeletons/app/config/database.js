module.exports = {

	development: {
  		adapter: 'sqlite',
  		database: 'db/development.sqlite3'
	},

	test: {
		adapter: 'sqlite',
  		database: 'db/test.sqlite3'	
	},

	production: {
		adapter: 'sqlite',
  		database: 'db/production.sqlite3'
	}
}

// adapter: 'mysql',
//   		database: 'my.server.tld:12345',
//   		maxConcurrentQueries: 100,
//   		pool: { maxConnections: 5, maxIdleTime: 30}