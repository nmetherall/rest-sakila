const mysql = require("mysql");
const mysqlDb = require("../../../mysqlConnection");
const queryParse = require("../urlQueryParser");

/**Method to parse and escape request parameters
 * @param {json} req - request passed from express router
 * @returns {json} a json element containing seperated and escaped values from the rquest
 */
const escapeReq = req => {
  //escapes entered path values
  return {
    baseTable: mysqlDb.escapeId(req.baseTable),
    baseIdField: mysqlDb.escapeId(`${req.baseTable}_id`),
    baseId: mysqlDb.escape(req.baseId),
    targetTable: mysqlDb.escapeId(req.targetTable),
    targetIdField: mysqlDb.escapeId(`${req.targetTable}_id`),
    targetId: mysqlDb.escape(req.params.targetId),
    columns: hasBody
      ? Object.keys(req.body).map(el => mysqlDb.escapeId(el))
      : "",
    rows: hasBody ? Object.values(req.body).map(el => mysqlDb.escape(el)) : "",
    tableName: checkTableName(req)
  };
};

/**
 * figures out the table name no matter which order it was entered in the request
 * throws an error if not a valid table name
 * @param {json} req - request passed from express router
 * @throws Will throw an error if there is no matching table in the database
 * @returns {string} returns an escaped version of the bridge table name
 */
const checkTableName = req => {
  let tableName = tables.includes(`${req.baseTable}_${req.targetTable}`)
    ? `${req.baseTable}_${req.targetTable}`
    : tables.includes(`${req.targetTable}_${req.baseTable}`)
    ? `${req.targetTable}_${req.baseTable}`
    : null;

  //throws an error if the bridge table isn't found
  if (!tableName) throw new Error("Not a valid bridge table");
  return mysqlDb.escapeId(tableName);
};

module.exports = {
  /**
   * GET /:baseTable/:baseId/:targetTable
   * Responds with all records from the target table that belong to the base table
   * @param {string} baseTable - The name of the table which is the starting point
   * @param {string} baseId - The primary key of the base table
   * @param {string} targetTable - The table that contains related records to the base table at the base id
   * @param {json} req - the request from the express http request
   * @param {json} res - the respons for the express http request
   */
  getAll: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    //json object of a parsed url query
    const parsedQuery = queryParse(req.query);

    //database query
    mysqlDb.query(
      res,
      `SELECT ${parsedQuery.fields}
      FROM ${escaped.tableName}
      INNER JOIN ${escaped.targetTable}
      ON ${escaped.targetTable}.${escaped.targetIdField}= ${
        escaped.tableName
      }.${escaped.targetIdField}
      WHERE ${escaped.tableName}.${escaped.baseIdField}=${escaped.baseId}
      ${
        parsedQuery.where
          ? ` AND ${escaped.targetTable}.${parsedQuery.where}`
          : ""
      }
      ${
        parsedQuery.orderBy
          ? `ORDER BY ${escaped.targetTable}.${parsedQuery.orderBy}`
          : ""
      }
      ${parsedQuery.limit}
      ${parsedQuery.offset}`
    );
  },

  //POST: /:baseTable/:baseId/:targetTable
  post: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    //database query
    mysqlDb.query(
      res,
      `INSERT INTO ${escaped.tableName} 
      (${escaped.columns.join(", ")}) 
      VALUES(${escaped.rows.join(", ")})`
    );
  },

  //GET /:baseTable/:baseId/:targetTable/:targetId
  get: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    //json object of a parsed url query
    const parsedQuery = queryParse(req.query);

    //database query and response
    mysqlDb.query(
      res,
      `SELECT ${parsedQuery.fields}
      FROM ${escaped.tableName}
	    INNER JOIN ${escaped.targetTable}
      ON ${escaped.targetTable}.${escaped.targetIdField}= ${escaped.tableName}.${escaped.targetIdField}
      INNER JOIN ${escaped.baseTable}
	    ON ${escaped.baseTable}.${escaped.baseIdField}= ${escaped.tableName}.${escaped.baseIdField}
      WHERE ${escaped.tableName}.${escaped.baseIdField}=${escaped.baseId} 
      AND ${escaped.tableName}.${escaped.targetIdField}=${targetId}`
    );
  },

  //PUT /:baseTable/:baseId/:targetTable/:targetId
  put: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    const rows = escaped.rows;
    //keys and values are formated and mapped to an array
    const pairs = escaped.columns.map((el, index) => {
      return `${el}=${rows[index]}`;
    });

    //database query and response
    mysqlDb.query(
      res,
      `UPDATE ${escaped.tableName} 
  	  SET ${pairs.join(", ")} 
  	  WHERE ${escaped.baseIdField} = ${escaped.baseId} 
      AND ${escaped.targetIdField} = ${targetId}`
    );
  },

  //DELETE /:baseTable/:baseId/:targetTable/:targetId
  delete: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    //database query and response
    mysqlDb.query(
      req,
      `DELETE FROM ${escaped.tableName} 
	    WHERE ${escaped.baseIdField} = ${escaped.baseId} 
  	  AND ${escaped.targetIdField} = ${targetId}`
    );
  }
};
