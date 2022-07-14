const Chalk = require('chalk');
const { Collection } = require('discord.js');

const DeployCommands = require('../utils/deployCommands');
const CommandLoader = require("../utils/loadCommands");

module.exports = async (client) => {
	console.log(Chalk.green('[Bot] I am connected to the Discord API!'));
	console.log(Chalk.green('[Bot] Logged in as:', client.user.tag));
	console.log(Chalk.green('[Bot] I am in', client.guilds.cache.size, (client.guilds.cache.size === 1 ? 'server' : 'servers')));

	// Prepare cooldown collection
	client.cooldowns = new Collection();

	// For each command, create a cooldown collection and add it to the original cooldown collection
	client.messageCommands.forEach(command => {
		client.cooldowns.set(command.name, new Collection());
	});

	// Since this is a leveling bot, and we don't want users to spam the bot, we'll create a cooldown for each server and in each server, we'll create a cooldown for each user
	client.levelingCooldowns = new Collection();
	client.guilds.cache.forEach(guild => {
		client.levelingCooldowns.set(guild.id, new Collection());
	});

	// Deploy the commands
	let cmdData = CommandLoader.getInteractionCommandData(client)
	DeployCommands.deploy(client, cmdData);
}