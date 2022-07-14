const fs = require('fs');
const Chalk = require('chalk');
const { Collection } = require('discord.js');
const path = require("path");

module.exports = {
	interactions: (client) => {
		console.log(Chalk.green('[Interaction Command Loader]'), 'Loading interaction commands...');
		client.interactionCommands = new Collection();
		let commandDirectories = fs.readdirSync(path.join(__dirname, "../commands/interaction"));
		for (let i = 0; i < commandDirectories.length; i++) {
			let commandDirectory = commandDirectories[i];
			let commandFiles = fs.readdirSync(path.join(__dirname, "../commands/interaction", commandDirectory));
			for (let j = 0; j < commandFiles.length; j++) {
				let commandFile = commandFiles[j];
				if (!commandFile.endsWith('.js')) {
					continue;
				}
				let command = require(`../commands/interaction/${commandDirectory}/${commandFile}`);
				client.interactionCommands.set(command.name, command);
				console.log(Chalk.green('[Interaction Command Loader]'), `Loaded interaction command: ${command.name}`);
			}
		}
		return client;
	},

	messages: (client) => {
		console.log(Chalk.green('[Message Command Loader]'), 'Loading message commands...');
		client.messageCommands = new Collection();
		client.messageCommandAliases = new Collection();
		let commandDirectories = fs.readdirSync(path.join(__dirname, "../commands/message"));
		for (let i = 0; i < commandDirectories.length; i++) {
			let commandDirectory = commandDirectories[i];
			let commandFiles = fs.readdirSync(path.join(__dirname, "../commands/message", commandDirectory));
			for (let j = 0; j < commandFiles.length; j++) {
				let commandFile = commandFiles[j];
				if (!commandFile.endsWith('.js')) {
					continue;
				}
				let command = require(`../commands/message/${commandDirectory}/${commandFile}`);
				client.messageCommands.set(command.name, command);
				if (command.aliases) {
					for (let k = 0; k < command.aliases.length; k++) {
						client.messageCommandAliases.set(command.aliases[k], command.name);
					}
				}
				console.log(Chalk.green('[Message Command Loader]'), `Loaded message command: ${command.name}`);
			}
		}
		return client;
	},

	getInteractionCommandData: (client) => {
		let interactionCommandData = [];
		let commandDirectories = fs.readdirSync(path.join(__dirname, "../commands/interaction"));
		for (let i = 0; i < commandDirectories.length; i++) {
			let commandDirectory = commandDirectories[i];
			let commandFiles = fs.readdirSync(path.join(__dirname, "../commands/interaction", commandDirectory));
			for (let j = 0; j < commandFiles.length; j++) {
				let commandFile = commandFiles[j];
				if (!commandFile.endsWith('.js')) {
					continue;
				}
				let command = require(`../commands/interaction/${commandDirectory}/${commandFile}`);
				interactionCommandData.push(command.data.toJSON());
			}
		}
		return interactionCommandData;
	},

	load(client) {
		client = this.interactions(client);
		client = this.messages(client);
		return client;
	}
}