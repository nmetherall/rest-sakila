const express = require("express");
const router = express.Router();

const db = require("../../mysqlConnection");

//Helper Method to determine the direction of the relationship
const targetBaseHelper = req => {
  return {
    baseTable: db.escapeId(req.baseTable),
    baseIdField: db.escapeId(`${req.baseTable}_id`),
    baseId: db.escape(req.baseId),
    targetTabel: db.escapeId(req.targetTable),
    targetIdField: db.escapeId(`${req.targetTable}_id`)
  };
};

//GET: SELECT ALL
router.get("/", (req, res) => {
  const tb = targetBaseHelper(req);

  //SQL statement
  const sql = `SELECT ${tb.targetTable}.* FROM film_actor INNER JOIN ${tb.targetTable} ON ${tb.targetTable}.${tb.targetIdField}= film_actor.${tb.targetId} WHERE film_actor.${tb.baseTable}_id=${tb.baseId}`;

  //database query
  db.query(sql, (err, results) => {
    if (err) console.log(err);
    res.send(JSON.stringify({ status: 200, error: null, response: results }));
  });
});

//POST: INSERT new row
router.post("/", (req, res) => {});

//PUT{ID}: UPDATE existing row
router.put("/:table/:id", (req, res) => {});

//DELETE{ID}: DELETE by id
router.delete("/:table/:id", (req, res) => {});

module.exports = router;
