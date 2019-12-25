const express = require("express");
const router = express.Router();

const mysqlDb = require("../../mysqlConnection");
const db = mysqlDb.database;

//Default
router.get("/", (req, res) => {
	res.status(200).send("Using Api version 2");
});

//GET: SELECT ALL
router.get("/:table", (req, res) => {
	//escaped table name
	const table = db.escapeId(req.params.table);

	//escaped query columns and rows from query
	const columns = Object.keys(req.query).map(el => db.escapeId(el));
	const rows = Object.values(req.query).map(el => db.escape(el));

	//keys and values are formated and mapped to an array
	const pairs = columns.map((el, index) => {
		return `${el}=${rows[index]}`;
	});

	//SQL filter
	const sqlFilter = pairs.length ? ` WHERE ${pairs.join("AND ")}` : "";
	//SQL statement
	const sql = `SELECT * from ${table}${sqlFilter}`;

	//database query and response
	db.query(sql, (err, results) => {
		if (err) console.log(err);
		res.status(200).json(results);
	});
});

//GET{ID}: SELECT by id
router.get("/:table/:id", (req, res) => {
	//escaped table name, id field, and id number
	const table = db.escapeId(req.params.table);
	const idField = db.escapeId(`${req.params.table}_id`);
	const id = db.escape(req.params.id);

	//SQL statement
	const sql = `SELECT * FROM ${table} WHERE ${idField} = ${id}`;

	//database query and response
	db.query(sql, (err, results) => {
		if (err) throw err;
		res.status(200).json(results);
		//res.send(JSON.stringify({ status: 200, error: null, response: results }));
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
	const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES(${rows.join(
		", "
	)})`;

	//database query and response
	db.query(sql, (err, results) => {
		if (err) throw err;
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
	const sql = `UPDATE ${table} SET ${pairs.join(
		", "
	)} WHERE ${idField} = ${id}`;
	console.log(sql);

	//database query and response
	db.query(sql, (err, results) => {
		if (err) throw err;
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
	const sql = `DELETE FROM ${table} WHERE ${idField} = ${id}`;

	//database query and response
	db.query(sql, (err, results) => {
		if (err) throw err;
		res.status(200).json(response);
	});
});

module.exports = router;
