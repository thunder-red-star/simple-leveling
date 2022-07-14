// Message Create event
const ms = require('ms');
const {Collection} = require("discord.js");

module.exports = async (interaction) => {
	let client = interaction.client;

	// Ignore bots and webhooks
	if (interaction.user.bot) return;
	if (interaction.webhookId) return;

	let guild = interaction.guild;

	// Get the command and the args
	let command = interaction.commandName;

	// Check if the command exists
	let cmd = client.interactionCommands.get(command);

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
						return interaction.channel.send({
							content: client.messages.botNoPermission.replace("{permission}", perm),
						});
					} catch (err) {
						// DM the user if the bot can't send messages to the channel
						return interaction.user.send({
							content: client.messages.botNoPermissionDM.replace("{permission}", perm),
						});
					}
				}
			}
		}

		if (cmd.memberPermissions && guild) {
			let member = guild.members.cache.get(interaction.user.id);
			if (!member) return;
			for (let perm of cmd.userPermissions) {
				if (!member.permissions.has(perm)) return interaction.reply({
					content: client.messages.userNoPermission,
				})
			}
		}

		// Owner only check
		if (cmd.ownerOnly && interaction.user.id !== client.config.owner) return interaction.reply({
			content: client.messages.ownerOnly
		})

		// Check if the command is in cooldown. The command cooldown will be found in client.cooldowns in the collection with the command name
		if (client.cooldowns.has(command)) {
			let cooldown = client.cooldowns.get(command);
			if (cooldown.has(interaction.user.id) && cooldown.get(interaction.user.id) > Date.now()) {
				let time = cooldown.get(interaction.user.id);
				let remaining = time - Date.now();
				return interaction.reply({
					content: client.messages.cooldown.replace("{time}", ms(remaining, { long: true }))
				});
			}
		}

		// The command is not in cooldown, so we can run the command
		try {
			cmd.run(interaction, client);
			console.log(`[${interaction.guild.name}] ${interaction.user.tag} ran the command ${cmd.name}`);
			// Add the command to the cooldown collection
			if (client.cooldowns.has(command)) {
				let cooldown = client.cooldowns.get(command);
				cooldown.set(interaction.user.id, Date.now() + cmd.cooldown);
			} else {
				client.cooldowns.set(command, new Collection());
			}
		} catch (err) {
			console.error(err);
			return interaction.reply({
				content: client.messages.unexpectedError.replace("{error}", err.stack)
			});
		}
	}
}