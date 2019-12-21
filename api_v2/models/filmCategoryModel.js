const express = require("express");
const router = express.Router();

const db = require("../../mysqlConnection");

//Helper Method to determine the direction of the relationship
const targetBaseHelper = req => {
    if(req.filmId) return{
        baseId : db.escape(req.filmId),
        baseTable : "film",
        targetTable : "category"
    }
    //if a film Id was passed
    else if(req.catId) return{
        baseId : db.escape(req.catId),
        baseTable : "category",
        targetTable : "film"
    }
}

//GET: SELECT ALL
router.get("/", (req, res) => {
    const tb = targetBaseHelper(req);

    //SQL statement
    const sql = `SELECT ${tb.targetTable}.* FROM film_category INNER JOIN ${tb.targetTable} ON ${tb.targetTable}.${tb.targetTable}_id = film_category.${tb.targetTable}_id WHERE film_category.${tb.baseTable}_id=${tb.baseId}`;

    //database query
    db.query(sql, (err, results) => {
        if(err)console.log(err);
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}))
    });
});

module.exports = router;