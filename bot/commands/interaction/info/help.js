const Paginate = require("../../../utils/interactionPaginator");
const fs = require("fs");
const ms = require("ms");
const DJSBuilders = require("@discordjs/builders");
const path = require("path");

module.exports = {
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "USE_EXTERNAL_EMOJIS"],
	userPermissions: [],
	enabled: true,
	guildOnly: false,
	ownerOnly: false,
	name: "help",
	description: "Get assistance with bot commands",
	detailedDescription: "Sends a message containing bot commands and their descriptions.",
	cooldown: 1000,
	data: new DJSBuilders.SlashCommandBuilder()
		.setName("help")
		.setDescription("Get assistance with bot commands")
		.addStringOption((option) => option
			.setName("command")
			.setDescription("The command to display help for.")
			.setRequired(false)
		),
	run: async function(interaction, client) {
		let command = interaction.options.getString("command");
		// If no query is provided, send a list of commands.
		if (!command) {
			// Scan directory of messageCommands for commands.
			let paginatorEmbeds = [];
			let modules = fs.readdirSync("./bot/commands/interaction");
			for (let i = 0; i < modules.length; i++) {
				let upperCaseModule = modules[i].charAt(0).toUpperCase() + modules[i].slice(1);
				let commandsInModule = fs.readdirSync(path.join(__dirname, `../../interaction/${modules[i]}`)).filter(file => file.endsWith(".js"));
				// If there are more than 10 commands in a module, split them into multiple pages.
				if (commandsInModule.length > 10) {
					for (let j = 0; j < commandsInModule.length; j += 10) {
						let moduleEmbed = new DJSBuilders.EmbedBuilder()
							.setTitle(`${upperCaseModule} Commands, Page ${Math.floor(j / 10) + 1}`)
							.setDescription("You can use `" + "/" + "help <command>` to get more information about a command.")
							.setColor(client.colors.success)
							.setFooter({
								text: "Keep in mind that this is the help command for interaction commands, not message commands."
							});
						if (commandsInModule.length > 0) {
							for (let k = j; k < j + 10 && k < commandsInModule.length; k++) {
								let command = require(`../../interaction/${modules[i]}/${commandsInModule[k]}`);
								moduleEmbed.addFields([{
									name: `\`/${command.name}\``,
									value: command.description,
									inline: false
								}]);
							}
						} else {
							moduleEmbed.setDescription("No commands (yet).");
						}
						paginatorEmbeds.push(moduleEmbed);
					}
				} else {
					let moduleEmbed = new DJSBuilders.EmbedBuilder()
						.setTitle(`${upperCaseModule} Commands`)
						.setDescription("You can use `" + "/" + "help <command>` to get more information about a command.")
						.setColor(client.colors.success);
					if (commandsInModule.length > 0) {
						for (let j = 0; j < commandsInModule.length; j++) {
							let command = require(`../../interaction/${modules[i]}/${commandsInModule[j]}`);
							moduleEmbed.addFields([{
								name: `\`/${command.name}\``,
								value: command.description,
								inline: false
							}]);
						}
					} else {
						moduleEmbed.setDescription("No commands (yet).");
					}
					paginatorEmbeds.push(moduleEmbed);
				}
			}
			await Paginate(interaction, paginatorEmbeds);
		} else {
			// Find the command.
			command = client.messageCommands.get(command);
			if (!command) {
				command = client.messageCommands.get(client.messageCommandAliases.get(command));
			}
			if (!command) {
				return interaction.reply({
					embeds: [{
						color: client.colors.error,
						description: client.customEmojis.cross + " I couldn't find a command with that name."
					}]
				});
			} else {
				let helpEmbed = new DJSBuilders.EmbedBuilder()
					.setTitle(`/${command.name}`)
					.setDescription(command.detailedDescription)
					.setColor(client.colors.success)
					.addFields([{
						name: "Cooldown",
						value: `${ms(command.cooldown, { long: true })}`,
					}])
					.addFields([{
						name: "Permissions Required",
						value: command.userPermissions.length > 0 ? command.userPermissions.map(perm => `\`${perm}\``).join(", ") : "None",
					}])
					.addFields([{
						name: "Bot Permissions Required",
						value: command.botPermissions.length > 0 ? command.botPermissions.map(perm => `\`${perm}\``).join(", ") : "None",
					}])
					.addFields([{
						name: "Other command info",
						value: `Enabled: ${command.enabled ? "Yes" : "No"}\nGuild Only: ${command.guildOnly ? "Yes" : "No"}\nOwner Only: ${command.ownerOnly ? "Yes" : "No"}`
					}]);
				interaction.reply({
					embeds: [helpEmbed]
				});
			}
		}
	}
}