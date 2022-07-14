const Fastify = require('fastify');
const { Liquid } = require('liquidjs');
const POV = require('@fastify/view');
const path = require("path");

const Chalk = require('chalk');
const fastifyStatic = require("@fastify/static");

require('dotenv').config();

module.exports = async (client) => {
	const app = Fastify({
		logger: false,
	});

	const engine = new Liquid({
		root: path.join(__dirname, 'templates'),
		extname: ".liquid",
	});

	app.register(POV, {
		engine: {
			liquid: engine,
		},
	})

	app.get('/', async (req, res) => {
		console.log(Chalk.green('[Web Server]'), `GET / (${req.ip})`);
		let html = await res.view("frontend/templates/homepage.liquid");
		return res.send(html);
	});

	// Serve all files in the public folder
	app.register(fastifyStatic, {
		root: path.join(__dirname, 'public'),
	});

	app.get('/leaderboard/:id', async (req, res) => {
		// Render the leaderboard template in /templates/
		console.log(Chalk.green('[Web Server]'), `GET /leaderboard/${req.params.id} (${req.ip})`);
		let html = await res.view("frontend/templates/leaderboard.liquid", {
			id: req.params.id,
			users: [
				{
					name: "John Doe",
					score: 100,
					rank: 1,
				},
				{
					name: "Jane Doe",
					score: 90,
					rank: 2,
				},
				{
					name: "Joe Doe",
					score: 80,
					rank: 3,
				},
				{
					name: "Jack Doe",
					score: 70,
					rank: 4,
				}
			]
		});
		res.send(html);
	});

// Start the server
	app.listen({
		port: process.env.PORT
	}, (err, address) => {
		if (err) {
			console.error(err);
			process.exit(1);
		}
		console.log(Chalk.green('[Web Server] Listening on port ' + process.env.PORT));
	});
}