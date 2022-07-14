const Discord = require('discord.js');
const EventLoader = require('./utils/eventLoader.js');
const CommandLoader = require('./utils/loadCommands.js');
const Database = require("./struct/DatabaseManager");
require('dotenv').config();

module.exports = () => {
	let client = new Discord.Client({
		intents: new Discord.IntentsBitField(131071),
		partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
	});

	EventLoader(client);
	client = CommandLoader.load(client);

	client.config = require('./assets/config.json');

	client.messages = require('./assets/messages.json');
	client.customEmojis = require('./assets/emojis.json');
	client.colors = require('./assets/colors.json');

	client.getServerPrefix = require('./utils/getServerPrefix.js');

	client.database = new Database();
	client.database.load();

	return client;
}