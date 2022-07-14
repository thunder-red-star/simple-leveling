const fs = require('fs');
const Chalk = require('chalk');
const path = require('path')

module.exports = (client) => {
	console.log(Chalk.green('[Event Loader]'), 'Loading events...');
	let events = fs.readdirSync(path.join(__dirname, "../events"))
	for (let i = 0; i < events.length; i++) {
		if (!events[i].endsWith('.js')) {
			return;
		}
		let event = events[i].split('.')[0];
		client.on(event, require(`../events/${event}`));
		console.log(Chalk.green('[Event Loader]'), `Loaded event: ${event}`);
	}
}