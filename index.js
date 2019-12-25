const express = require('express');
const db = require('./db');
const PORT = process.env.PORT || 9000;
const ApiError = require('./helpers/api_error');
global.ApiError = ApiError;
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

app.patch('/api/grades/:record_pid', async (req, res, next) => {
	const { record_pid } = req.params;

	const { course, grade, name } = req.body;
	let errors = [];

	let code = [];

	try { 
	
		const [[ record ]] = await db.query('SELECT * FROM grades WHERE pid=?', [record_pid])
		console.log('Record', record)
		if(record == undefined){
			code.push (404)
			errors.push (`No record found with an ID of ${record_pid}`)
		}
		if (!name) {
			code.push (400)
			errors.push("No valid fields received to update")
		} 
		else if(!grade) {
			code.push (400)
			errors.push("No valid fields received to update")
		}
		else if(!course) {
			code.push (400)
			errors.push("No valid fields received to update")
		}

		if (grade < 0 || grade > 100) {
			code.push(422)
			errors.push(`Course grade must be a number between 0 and 100 inclusive, ${grade} is invalid`)
		}
		if (errors.length) {
			res.send({
			code,
			errors,
			message: "Bad PATCH Request"
			})
			return;
		}

		const result = await db.execute(`
			UPDATE grades 
			SET course = ?,grade = ?,name = ? WHERE pid = ?
		`, [course, grade, name, record_pid])

		const [[ updateStudent ]] = await db.query(`SELECT * FROM grades WHERE pid = ?`, [record_pid])

		res.send({
		message: `Student ${record_pid} has been updated`,
		updateStudent
		})

	} 
	catch (errors) {
		next(errors)
  	}


});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log('Our server is running @ localhost:', PORT);

});

//	Basic INSERT query
// INSERT INTO `grades`(`pid`, `course`, `grade`, `name`) VALUES (UUID(),"Chemistry",83,"Sally Hawkins")