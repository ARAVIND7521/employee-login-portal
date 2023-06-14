const mysql = require('mysql');
const doenv = require('dotenv');

doenv.config({
    path:'./.env'
})
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE
});

db.connect(function (err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = db;