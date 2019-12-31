const express = require("express");
const router = express.Router();

const mysqlDb = require("../../mysqlConnection");
const db = mysqlDb.database;

const queryParse = require("../urlQueryParser");

//GET: SELECT ALL
router.get("/:table", (req, res) => {
  //escaped table name
  const table = db.escapeId(req.params.table);

  //json object of a parsed url query
  const parsedQuery = queryParse(req.query);

  //SQL statement
  const sql = `SELECT ${parsedQuery.fields} FROM ${table}
  ${parsedQuery.where ? `WHERE ${parsedQuery.where}` : ""}
  ${parsedQuery.orderBy ? `ORDER BY ${parsedQuery.orderBy}` : ""}
  ${parsedQuery.limit}
  ${parsedQuery.offset}`;

  console.log("sql:", sql);
  //database query and response
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).json(results);
  });
});

//GET{ID}: SELECT by id
router.get("/:table/:id", (req, res) => {
  //escaped table name, id field, and id number
  const table = db.escapeId(req.params.table);
  const idField = db.escapeId(`${req.params.table}_id`);
  const id = db.escape(req.params.id);

  //json object of a parsed url query
  const parsedQuery = queryParse(req.query);

  //SQL statement
  const sql = `SELECT ${parsedQuery.fields} FROM ${table} 
	WHERE ${idField} = ${id}`;

  //database query and response
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).json(results);
  });
});

//POST: INSERT new row
router.post("/:table", (req, res) => {
  //escaped table name
  const table = db.escapeId(req.params.table);

  //escaped columns and rows from body
  const columns = Object.keys(req.body).map(el => db.escapeId(el));
  const rows = Object.values(req.body).map(el => db.escape(el));

  //SQL statement
  const sql = `INSERT INTO ${table} 
	(${columns.join(", ")}) 
	VALUES(${rows.join(", ")})`;

  //database query and response
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(201).send(results);
  });
});

//PUT{ID}: UPDATE existing row
router.put("/:table/:id", (req, res) => {
  //escaped table name, id field, and id number
  const table = db.escapeId(req.params.table);
  const idField = db.escapeId(`${req.params.table}_id`);
  const id = db.escape(req.params.id);

  //escaped columns and rows from body
  const columns = Object.keys(req.body).map(el => db.escapeId(el));
  const rows = Object.values(req.body).map(el => db.escape(el));

  //keys and values are formated and mapped to an array
  const pairs = columns.map((el, index) => {
    return `${el}=${rows[index]}`;
  });

  //SQL statement
  const sql = `UPDATE ${table} 
	SET ${pairs.join(", ")} 
	WHERE ${idField} = ${id}`;

  //database query and response
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).json(results);
  });
});

//DELETE{ID}: DELETE by id
router.delete("/:table/:id", (req, res) => {
  //escaped table name, id field, and id number
  const table = db.escapeId(req.params.table);
  const idField = db.escapeId(`${req.params.table}_id`);
  const id = db.escape(req.params.id);

  //SQL statement
  const sql = `DELETE FROM ${table} 
	WHERE ${idField} = ${id}`;

  //database query and response
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).json(results);
  });
});

module.exports = router;
