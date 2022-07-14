const DJSBuilders = require("@discordjs/builders");

module.exports = {
	botPermissions: ["SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "USE_EXTERNAL_EMOJIS"],
	userPermissions: [],
	enabled: true,
	guildOnly: false,
	ownerOnly: false,
	name: "invite",
	aliases: [],
	description: "Sends the bot's invite link.",
	detailedDescription: "Sends the bot's invite link.",
	cooldown: 1000,
	data: new DJSBuilders.SlashCommandBuilder()
		.setName("invite")
		.setDescription("Sends the bot's invite link."),
	run: async function(interaction, client) {
		// Create an invite embed.
		const inviteEmbed = new DJSBuilders.EmbedBuilder()
			.setTitle("Invite me!")
			.setDescription("Click the button below to invite me to your server.")
			.setColor(client.colors.success);
		const inviteButton = new DJSBuilders.ButtonBuilder()
			.setLabel("Invite")
			.setURL(`https://discordapp.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=8`)
			.setStyle(5);
		const inviteButtonRow = new DJSBuilders.ActionRowBuilder()
			.addComponents(inviteButton);

		return interaction.reply({
			embeds: [inviteEmbed],
			components: [inviteButtonRow]
		});
	}
};