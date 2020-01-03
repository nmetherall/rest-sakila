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

const tables = [];
database.query(`SHOW tables`, (req, res) => {
  this.tables = res.forEach(el => tables.push(el.Tables_in_sakila));
});

const query = (res,sql) => {
  database.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).send(results);
  });
}
module.exports = { 
  database, 
  tables, 
  query
};
