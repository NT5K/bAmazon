
const mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',  // your password
    database: 'bamazon',
    port: 3306
})

module.exports = connection