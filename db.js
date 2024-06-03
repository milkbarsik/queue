const Pool = require('pg').Pool
const pool = new Pool ({
	user: "postgres",
	password: "barsik",
	host: "localhost",
	port: 5432,
	database: "queue"
})

module.exports = pool;