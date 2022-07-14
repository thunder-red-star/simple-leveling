// Database manager for bot. Manages all sub-databases (servers and users)
const ServerManager = require('./ServerManager.js');

const Database = require('./database.js');

class DatabaseManager {
	constructor () {
		this.servers = new ServerManager();
	}

	load () {
		Database.load();
		this.servers = new ServerManager()
		this.servers.fromJSON(Database.get('servers'));
	}

	write () {
		Database.set('servers', this.servers.toJSON());
		Database.write();
	}
}

module.exports = DatabaseManager;