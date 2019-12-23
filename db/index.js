const mysql = require('mysql2');

const config = require('../config/db');

const pool = mysql.createPool(config);

module.exports = pool.promise();;