const express = require('express');
const db = require('./db');
const PORT = 3000 || 9000;

const app = express();



app.get('/api/test', async (req,res) => {

	const [[ result ]] = await db.query(`
	SELECT * FROM grades`);

	const message = `Test route '/api/test' working `;

	res.send({
		message: message,
		results: result,
	});

});

app.listen(PORT, () => {
	console.log('Our server is running @ localhost:', PORT);

});

//	Basic INSERT query
// INSERT INTO `grades`(`pid`, `course`, `grade`, `name`) VALUES (UUID(),"Chemistry",83,"Sally Hawkins")