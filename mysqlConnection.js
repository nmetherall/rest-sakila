const mysql = require("mysql");

const database = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "test",
  database: "sakila"
});

database.connect(function(err) {
  if (err) throw err;
  console.log(`Connected to ${database.config.database}`);
});

let tables = [];
database.query(`SHOW tables`, (req, res) => {
  this.tables = res.forEach(el => tables.push(el.Tables_in_sakila));
});
module.exports = { database, tables };
