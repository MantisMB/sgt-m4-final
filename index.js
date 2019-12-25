const express = require('express');
const db = require('./db');
const PORT = process.env.PORT || 9000;
const errorHandler = require('./middleware/error_handler');

const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

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

app.post('/api/grades', async (req, res) => {

	const { course, grade, name } = req.body;
	const errors = [];

	if(!course){
        errors.push('No course name received');
    }
	if(!name){
        errors.push('No student name received');
    }
    if( !grade && grade !==0 ){
        errors.push('Students grade not received');
    } else if(isNaN(grade)){
        errors.push('Course grade for student must be a number');
    } else if(grade < 0 || grade > 100) {
        errors.push(`Course grade must be a number between 0 and 100 inclusive. ${grade} is invalid.`);
    }

    if(errors.length){
        res.status(422).send({
			code: 422,
			errors,
			message: "Bad POST request"
        });
        return;
	}
	
	const addStudent = await db.execute(`
        INSERT INTO grades
        (pid, course, grade, name) 
        VALUES (UUID(),?, ?, ?)
	`, [course, grade, name]);
	
	const [[ record ]] = await db.query(`
		SELECT pid,course,grade,name,updated AS lastUpdated 
		FROM grades 
		WHERE course=? AND grade=? AND name=?`,[course, grade, name]
		)

    res.send({
        message: `New student grade record created successfully`,
        record   
    });

})


app.use(errorHandler);

app.listen(PORT, () => {
	console.log('Our server is running @ localhost:', PORT);

});

//	Basic INSERT query
// INSERT INTO `grades`(`pid`, `course`, `grade`, `name`) VALUES (UUID(),"Chemistry",83,"Sally Hawkins")