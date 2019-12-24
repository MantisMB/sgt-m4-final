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

app.get('/api/grades', async (req, res) => {

	const [ result ] = await db.execute('SELECT `pid`, `course`, `grade`, `name`, `created`, `updated` FROM `grades` WHERE 1');

	const records = result.map(studentGrade => {
		const { pid, course, grade, name, updated} = studentGrade;

		return {
			
				pid: pid,
				course: course,
				grade: grade,
				name: name,
				lastUpdated: updated,
			
		}
	})

	

	res.send({ records })

});


app.listen(PORT, () => {
	console.log('Our server is running @ localhost:', PORT);

});

//	Basic INSERT query
// INSERT INTO `grades`(`pid`, `course`, `grade`, `name`) VALUES (UUID(),"Chemistry",83,"Sally Hawkins")