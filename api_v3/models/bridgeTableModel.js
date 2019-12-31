const express = require("express");
const router = express.Router();

const mysqlDb = require("../../mysqlConnection");
//database connection
const db = mysqlDb.database;
//a list of table names in the database
const tables = mysqlDb.tables;

const queryParse = require("../urlQueryParser");

//GET: SELECT ALL
router.get("/", (req, res) => {
  //calls a helper to help parse the request
  const tb = targetBaseHelper(req);

  const parsedQuery = queryParse(req.query);

  //SQL statement
  const sql = `SELECT ${parsedQuery.fields}
  FROM ${tb.tableName}
	INNER JOIN ${tb.targetTable}
	ON ${tb.targetTable}.${tb.targetIdField}= ${tb.tableName}.${tb.targetIdField}
  WHERE ${tb.tableName}.${tb.baseIdField}=${tb.baseId}
  ${parsedQuery.where ? ` AND ${tb.targetTable}.${parsedQuery.where}` : ""}
  ${
    parsedQuery.orderBy
      ? `ORDER BY ${tb.targetTable}.${parsedQuery.orderBy}`
      : ""
  }
  ${parsedQuery.limit}
  ${parsedQuery.offset}`;

  console.log("sql", sql);

  //database query
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).json(results);
  });
});

//POST: INSERT new row
router.post("/", (req, res) => {
  //calls a helper to help parse the request
  const tb = targetBaseHelper(req);

  //escaped columns and rows from body
  const columns = Object.keys(req.body).map(el => db.escapeId(el));
  const rows = Object.values(req.body).map(el => db.escape(el));

  //SQL statement
  const sql = `INSERT INTO ${tb.tableName} 
	(${columns.join(", ")}) 
	VALUES(${rows.join(", ")})`;

  //database query
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(201).json(results);
  });
});

//PUT{ID}: UPDATE existing row
router.put("/:targetId", (req, res) => {
  //calls a helper to help parse the request
  const tb = targetBaseHelper(req);

  //escaped target table id number
  const targetId = db.escape(req.params.targetId);

  //escaped columns and rows from body
  const columns = Object.keys(req.body).map(el => db.escapeId(el));
  const rows = Object.values(req.body).map(el => db.escape(el));

  //keys and values are formated and mapped to an array
  const pairs = columns.map((el, index) => {
    return `${el}=${rows[index]}`;
  });

  //SQL statement
  const sql = `UPDATE ${tb.tableName} 
	SET ${pairs.join(", ")} 
	WHERE ${tb.baseIdField} = ${tb.baseId} 
	AND ${tb.targetIdField} = ${targetId}`;

  //database query and response
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).json(results);
  });
});

//DELETE{ID}: DELETE by id
router.delete("/:targetId", (req, res) => {
  //calls a helper to help parse the request
  const tb = targetBaseHelper(req);

  //escaped target table id number
  const targetId = db.escape(req.params.targetId);

  //SQL statement
  const sql = `DELETE FROM ${tb.tableName} 
	WHERE ${tb.baseIdField} = ${tb.baseId} 
	AND ${tb.targetIdField} = ${targetId}`;

  //database query and response
  db.query(sql, (err, results) => {
    if (err) res.status(400).json(err);
    res.status(200).json(results);
  });
});

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

module.exports = router;
