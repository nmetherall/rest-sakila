const express = require("express");
const router = express.Router();

const mysqlDb = require("../../mysqlConnection");
//database connection
const db = mysqlDb.database;
//a list of table names in the database
const tables = mysqlDb.tables;

//Helper Method to determine the direction of the relationship
const targetBaseHelper = req => {
	//figures out the table name no matter which order it was entered in the request
	let tableName = tables.includes(`${req.baseTable}_${req.targetTable}`)
		? `${req.baseTable}_${req.targetTable}`
		: tables.includes(`${req.targetTable}_${req.baseTable}`)
		? `${req.targetTable}_${req.baseTable}`
		: null;

	//throws an error if the bridge table isn't found
	if (!tableName) throw new Error("Not a valid bridge table");
	tableName = db.escapeId(tableName);

	//escapes entered path values
	return {
		baseTable: db.escapeId(req.baseTable),
		baseIdField: db.escapeId(`${req.baseTable}_id`),
		baseId: db.escape(req.baseId),
		targetTable: db.escapeId(req.targetTable),
		targetIdField: db.escapeId(`${req.targetTable}_id`),
		tableName: tableName
	};
};

//GET: SELECT ALL
router.get("/", (req, res) => {
	const tb = targetBaseHelper(req);

	//SQL statement
	const sql = `SELECT ${tb.targetTable}.* FROM ${tb.tableName} INNER JOIN ${tb.targetTable} ON ${tb.targetTable}.${tb.targetIdField}= ${tb.tableName}.${tb.targetIdField} WHERE ${tb.tableName}.${tb.baseIdField}=${tb.baseId}`;

	//database query
	db.query(sql, (err, results) => {
		if (err) console.log(err);
		res.status(200).json(results);
	});
});

//POST: INSERT new row
router.post("/", (req, res) => {
	const tb = targetBaseHelper(req);

	//escaped columns and rows from body
	const columns = Object.keys(req.body).map(el => db.escapeId(el));
	const rows = Object.values(req.body).map(el => db.escape(el));

	//SQL statement
	const sql = `INSERT INTO ${tb.baseTable} (${columns.join(
		", "
	)}) VALUES(${rows.join(", ")})`;

	//database query
	db.query(sql, (err, results) => {
		if (err) throw err;
		res.status(201).json(results);
	});
});

//PUT{ID}: UPDATE existing row
router.put("/:tagetId", (req, res) => {
	//TODO: fill in method
});

//DELETE{ID}: DELETE by id
router.delete("/:targetId", (req, res) => {
	//TODO: fill in method
});

module.exports = router;
