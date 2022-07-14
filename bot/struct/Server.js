const MemberManager = require('./MemberManager');

class Server {
	// Class representing a discord server the bot is in.
	constructor(serverId = "") {
		this.serverId = serverId;
		this.serverPrefix = "";
		this.serverConfig = {};
		this.serverLeaderboard = new MemberManager();
	}

	// Get the server's id.
	getId() {
		return this.serverId;
	}

	// Get the server's prefix.
	getPrefix() {
		return this.serverPrefix;
	}

	// Get the server's config.
	getConfig() {
		return this.serverConfig;
	}

	// Set the server's config.
	setConfig(config) {
		this.serverConfig = config;
	}

	setPrefix(prefix) {
		this.serverPrefix = prefix;
	}

	// Edit a config option.
	editConfig(key, value) {
		this.serverConfig[key] = value;
	}

	getLeaderboard() {
		return this.serverLeaderboard;
	}

	setLeaderboard(leaderboard) {
		this.serverLeaderboard = leaderboard;
	}

	fromJSON(json) {
		this.serverId = json.serverId;
		this.serverPrefix = json.serverPrefix;
		this.serverConfig = json.serverConfig;
		this.serverLeaderboard.fromJSON(json.serverLeaderboard);
		return this;
	}

	toJSON() {
		return {
			serverId: this.serverId,
			serverPrefix: this.serverPrefix,
			serverConfig: this.serverConfig,
			serverLeaderboard: this.serverLeaderboard.toJSON()
		};
	}
}

module.exports = Server;