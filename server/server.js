const express = require('express');
const path = require('path');
const moment = require('moment');
const router = require('../router/router');

const app = express();

app.set('vie engine', 'ejs');

const PORT = 7777;

app.use(express.static('ejs'));
app.use(express.json());
app.use('/api', router);

const createPath = (page) => path.resolve(__dirname, `../ejs`, `${page}/${page}.ejs`);

app.listen(PORT, async (err) => {
	err ? console.log(err) : 'server is started';
})

app.get('/', async (req, res) => {
	try{
		res.render(createPath('home'));
	} catch (err) {
		console.log(err);
		res.status(500).send('Server Error');
	}
});

app.get('/terminal', async (req, res) => {
	try {
		const doctorsData = await fetch('http://localhost:7777/api/online-queue');
		const doctors = await doctorsData.json();
		res.render(createPath('terminal'), {doctors: doctors});
	} catch (err) {
		console.log(err);
		res.status(500).send('Server error');
	}
});

app.get('/online-queue', async (req, res) => {
	try {
		const doctorsData = await fetch('http://localhost:7777/api/online-queue');
		const doctors = await doctorsData.json();
		res.render(createPath('onlineQueue'), {doctors: doctors});
	} catch (err) {
		console.log(err);
		res.status(500).send('Server error');
	}
})

module.exports = app;