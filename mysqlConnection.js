const mysql = require("mysql");

var db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "test",
  database: "sakila"
});

db.connect(function(err) {
  if (err) throw err;
  console.log(`Connected to ${db.config.database}`);
});

module.exports = db;
