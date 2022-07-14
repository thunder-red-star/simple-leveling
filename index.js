const Bot = require('./bot/index.js');
const App = require('./frontend/app.js');

client = Bot();
App(client);

client.login(process.env.TOKEN);