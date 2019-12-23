const express = require('express');
const PORT = 3000 || 9000;

const app = express();



app.get('/api/test', (req,res) => {

	const message = `Test route '/api/test' working `;

	res.send({
		message: message,
	});

});

app.listen(PORT, () => {
	console.log('Our server is running @ localhost:', PORT);

});