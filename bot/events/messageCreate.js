// Message Create event
const ms = require('ms');
const ArgsParser = require('../utils/argParser');
const {Collection} = require("discord.js");
const calculateLevel = require('../utils/calculateLevel');

module.exports = async (message) => {
	let client = message.client;

	// Ignore bots and webhooks
	if (message.author.bot) return;
	if (message.webhookId) return;

	// If the bot gets mentioned, respond with the bot's prefix.
	if (message.mentions.has(client.user)) {
		message.channel.send({
			embeds: [{
				color: client.colors.success,
				title: "Hi!",
				description: "My prefix is `" + client.getServerPrefix(message) + "`. Use `" + client.getServerPrefix(message) + "help` to see my commands. You can also run most of my commands as slash commands, like `/help`."
			}]
		});
	}

	// Check if the message starts with the prefix
	let guild = message.guild;
	let prefix = client.getServerPrefix(message);
	if (message.content.startsWith(prefix)) {

		// Get the command and the args
		let command = message.content.split(" ")[0].slice(prefix.length);

		// Check if the command exists
		let cmd = client.messageCommands.get(command);
		if (!cmd) {
			cmd = client.messageCommands.get(client.messageCommandAliases.get(command));
		}

		if (cmd) {
			// Check if the command is enabled
			if (!cmd.enabled) return;

			// Check if the command is in the guild
			if (cmd.guildOnly && !guild) return;

			// Permission check for bot, if command was used in a guild
			let me = await guild.members.fetch(client.user.id);
			if (cmd.botPermissions && guild) {
				for (let perm of cmd.botPermissions) {
					if (!me.permissions.has(perm)) {
						try {
							return message.channel.send({
								content: client.messages.botNoPermission.replace("{permission}", perm),
							});
						} catch (err) {
							// DM the user if the bot can't send messages to the channel
							return message.author.send({
								content: client.messages.botNoPermissionDM.replace("{permission}", perm),
							});
						}
					}
				}
			}

			// After this point we can assume the bot has the permissions to send messages in the channel

			// Permission check for member using command, but skip the check if command was not used in a guild
			if (cmd.memberPermissions && guild) {
				let member = guild.members.cache.get(message.author.id);
				if (!member) return;
				for (let perm of cmd.userPermissions) {
					if (!member.permissions.has(perm)) return message.channel.send({
						content: client.messages.userNoPermission,
					})
				}
			}

			// Owner only check
			if (cmd.ownerOnly && message.author.id !== client.config.owner) return message.channel.send({
				content: client.messages.ownerOnly
			})

			// Check if the command is in cooldown. The command cooldown will be found in client.cooldowns in the collection with the command name
			if (client.cooldowns.has(command)) {
				let cooldown = client.cooldowns.get(command);
				if (cooldown.has(message.author.id) && cooldown.get(message.author.id) > Date.now()) {
					let time = cooldown.get(message.author.id);
					let remaining = time - Date.now();
					return message.channel.send({
						content: client.messages.cooldown.replace("{time}", ms(remaining, {long: true}))
					});
				}
			}

			// The command is not in cooldown, so we can run the command
			try {
				let parsedArgs = await ArgsParser(message, cmd.args);
				// If the parsed args does not contain every required argument, return an error
				for (let arg of cmd.args) {
					if (arg.required && (parsedArgs[arg.name] === undefined || parsedArgs[arg.name] === null)) {
						return message.channel.send({
							content: client.messages.noArgs.replace("{argument}", arg.name).replace("{type}", arg.type)
						});
					}
				}
				cmd.run(message, client, parsedArgs);
				console.log(`[${message.guild.name}] ${message.author.tag} ran the command ${cmd.name}`);
				// Add the command to the cooldown collection
				if (client.cooldowns.has(command)) {
					let cooldown = client.cooldowns.get(command);
					cooldown.set(message.author.id, Date.now() + cmd.cooldown);
				} else {
					client.cooldowns.set(command, new Collection());
					let cooldown = client.cooldowns.get(command);
					cooldown.set(message.author.id, Date.now() + cmd.cooldown);
				}
			} catch (err) {
				console.error(err);
				return message.channel.send({
					content: client.messages.unexpectedError.replace("{error}", err.stack)
				});
			}
		}
	} else if (guild) {
		// So the message is in a server. Now we need to check if this message passes the cooldown, so users can't spam messages to get XP.
		if (client.levelingCooldowns.has(guild.id)) {
			let serverCooldown = client.levelingCooldowns.get(guild.id);
			if (serverCooldown.has(message.author.id) && serverCooldown.get(message.author.id) > Date.now()) {
				return;
			} else {
				// The message is not in cooldown, so we can grant the user XP.
				let server = client.database.servers.get(guild.id);
				if (!server) {
					client.database.servers.addServer(message.guild.id);
					server = client.database.servers.get(guild.id);
					server.setPrefix(client.config.defaultPrefix);
					client.database.write();
					server = client.database.servers.get(message.guild.id);
				}
				let user = server.serverLeaderboard.getMember(message.author.id);
				if (!user) {
					server.serverLeaderboard.addMember(message.author.id);
					user = server.serverLeaderboard.getMember(message.author.id);
				}
				if (user) {
					let randomXPAmount = Math.floor(Math.random() * ((server.serverConfig.xpGainMax || 13) - (server.serverConfig.xpGainMin + 1 || 7))) + (server.serverConfig.xpGainMin || 7);
					user.addXP(randomXPAmount);
					client.database.write();
					console.log(`[${message.guild.name}] ${message.author.tag} gained ${randomXPAmount} XP`);
					// Check if the user has leveled up
					if (user.lastCheckedLevel < calculateLevel(user.xp)) {
						user.lastCheckedLevel = calculateLevel(user.xp);
						client.database.write();
						message.channel.send({
							content: "**" + message.author.tag + "** has leveled up to level **" + user.lastCheckedLevel + "**!"
						});
					}
				}

				// Add the user to the leveling cooldown collection
				serverCooldown.set(message.author.id, Date.now() + server.serverConfig.xpCooldown || 0);
			}
		} else {
			client.levelingCooldowns.set(guild.id, new Collection());
		}
	}
}