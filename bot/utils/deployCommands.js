const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const token = process.env.TOKEN;
const { testGuildId } = require("../assets/config.json");

const Chalk = require("chalk");

function deploy(client, commandsList) {
	const rest = new REST({ version: "9" }).setToken(token);

	(async () => {
		try {
			console.log(Chalk.yellow("[Slash Commands] Registering all commands at test server"));
			await rest.put(Routes.applicationGuildCommands(client.user.id, testGuildId), {
				body: commandsList,
			});
			console.log(
				Chalk.green("[Slash Commands] Successfully registered all commands to test server!")
			);
			console.log(Chalk.yellow("[Slash Commands] Registering all commands at all servers"));

			await rest.put(Routes.applicationCommands(client.user.id), {
				body: commandsList,
			});
			console.log(
				Chalk.green("[Slash Commands] Successfully registered all commands to all servers!")
			);
		} catch (error) {
			console.error(error);
		}
	})();
}

function deployGuild(client, commandsList, guild) {
	const rest = new REST({ version: "9" }).setToken(token);

	(async () => {
		try {
			console.log(Chalk.yellow("[Slash Commands] Registering all commands at test server"));
			await rest.put(Routes.applicationGuildCommands(client.user.id, guild), {
				body: commandsList,
			});
			console.log(
				Chalk.green("[Slash Commands] Successfully registered all commands to test server!")
			);
		} catch (error) {
			console.error(error);
		}
	})();
}

module.exports = { deploy: deploy, deployGuild: deployGuild };