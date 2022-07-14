const DJSBuilders = require('@discordjs/builders');

const buttonArray = [
	new DJSBuilders.ButtonBuilder().setCustomId('first').setStyle(1).setEmoji({
		name: '⏪',
		id: '975607423161221130',
		animated: false
	}),
	new DJSBuilders.ButtonBuilder().setCustomId('back').setStyle(1).setEmoji({
		name: '◀',
		id: '975607423299616768',
		animated: false
	}),
	new DJSBuilders.ButtonBuilder().setCustomId('discard').setStyle(4).setEmoji({
		name: '🗑',
		id: '975607423345766440',
		animated: false
	}),
	new DJSBuilders.ButtonBuilder().setCustomId('forward').setStyle(1).setEmoji({
		name: '▶',
		id: '975607423257690202',
		animated: false
	}),
	new DJSBuilders.ButtonBuilder().setCustomId('last').setStyle(1).setEmoji({
		name: '⏩',
		id: '975607423215730728',
		animated: false
	})
];

module.exports = async function (interaction, pages) {
	// Message should be a Discord.Message
	// Pages should be an array of Discord.Embeds or DJSBuilders.Embed

	let newActionRow = new DJSBuilders.ActionRowBuilder();
	let page = 0;
	for (let i = 0; i < buttonArray.length; i++) {
		// Copy the button into a new button
		let newButton = new DJSBuilders.ButtonBuilder().setCustomId(buttonArray[i].data.custom_id).setStyle(buttonArray[i].data.style).setEmoji(buttonArray[i].data.emoji);
		if (page === 0 && (i === 0 || i === 1)) {
			newButton.setDisabled(true);
		}
		if (page === pages.length - 1 && (i === 3 || i === 4)) {
			newButton.setDisabled(true);
		}
		newActionRow.addComponents([newButton]);
	}

	// Send the page with the array of buttons
	if (interaction.deferred == false) {
		await interaction.deferReply();
	}


	const curPage = await interaction.editReply({
		content: `Page ${page + 1} / ${pages.length}`, embeds: [pages[page]], components: [newActionRow], fetchReply: true,
	});

	const filter = (i) => i != null

	const collector = await curPage.createMessageComponentCollector({
		filter, time: 60000,
	});

	// Add the button collector event listeners
	collector.on('collect', async (button) => {
		switch (button.customId) {
			case 'first':
				page = 0;
				break;
			case 'back':
				if (page > 0) {
					page--;
				}
				break;
			case 'discard':
				msg.delete();
				return;
			case 'forward':
				if (page < pages.length - 1) {
					page++;
				}
				break;
			case 'last':
				page = pages.length - 1;
				break;
		}

		await button.deferUpdate();

		// Reset the timeout
		collector.resetTimer();

		let newActionRow = new DJSBuilders.ActionRowBuilder();
		for (let i = 0; i < buttonArray.length; i++) {
			// Copy the button into a new button
			let newButton = new DJSBuilders.ButtonBuilder().setCustomId(buttonArray[i].data.custom_id).setStyle(buttonArray[i].data.style).setEmoji(buttonArray[i].data.emoji);
			if (page === 0 && (i === 0 || i === 1)) {
				newButton.setDisabled(true);
			}
			if (page === pages.length - 1 && (i === 3 || i === 4)) {
				newButton.setDisabled(true);
			}
			newActionRow.addComponents([newButton]);
		}

		// Send the new page
		await button.editReply({
			content: `Page ${page + 1} / ${pages.length}`, embeds: [pages[page]], components: [newActionRow], fetchReply: true,
		});
	});

	collector.on('end', async (collected, reason) => {
		// If message was deleted, do nothing
		try {
			// Create a new action row, but with all buttons disabled
			let actionRow = new DJSBuilders.ActionRowBuilder();
			for (let i = 0; i < buttonArray.length; i++) {
				actionRow.addComponents(buttonArray[i].setDisabled(true));
			}

			// Send the new page
			await interaction.edit({
				content: `Page ${page + 1} of ${pages.length}`,
				embeds: [pages[page]],
				components: [actionRow]
			});
		} catch (e) {
			// Do nothing since message was deleted
		}
	});

	return curPage;
}