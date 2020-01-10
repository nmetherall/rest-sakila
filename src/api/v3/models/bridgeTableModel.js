const mysql = require("mysql");
const mysqlDb = require("../../../mysqlConnection");
const queryParse = require("../urlQueryParser");

/**Method to parse and escape request parameters
 * @param {json} req - request passed from express router
 * @returns {json} a json element containing seperated and escaped values from the rquest
 */
const escapeReq = req => {
  const hasBody = !!req.body.length;
  return {
    baseTable: mysql.escapeId(req.params.baseTable),
    baseIdField: mysql.escapeId(`${req.params.baseTable}_id`),
    baseId: mysql.escape(req.params.baseId),
    targetTable: mysql.escapeId(req.params.targetTable),
    targetIdField: mysql.escapeId(`${req.params.targetTable}_id`),
    targetId: mysql.escape(req.params.targetId),
    columns: hasBody ? Object.keys(req.body).map(el => mysql.escapeId(el)) : "",
    rows: hasBody ? Object.values(req.body).map(el => mysql.escape(el)) : "",
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
  const tables = mysqlDb.tables;
  const baseTarget = `${req.params.baseTable}_${req.params.targetTable}`;
  const targetBase = `${req.params.targetTable}_${req.params.baseTable}`;

  let tableName = tables.includes(baseTarget)
    ? baseTarget
    : tables.includes(targetBase)
    ? targetBase
    : null;
  //throws an error if the bridge table isn't found
  if (!tableName) throw new Error("Not a valid bridge table");
  return mysql.escapeId(tableName);
};

module.exports = {
  /**
   * GET /:baseTable/:baseId/:targetTable
   * Responds with all records from the target table that belong to the base table
   * @param {string} baseTable - The name of the table which is the starting point
   * @param {string} baseId - The primary key of the base table
   * @param {string} targetTable - The table that contains related records to the base table at the base id
   * @param {json} req - the request from the express http request
   * @param {json} res - the respons for the express http
   */
  getAll: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    //json object of a parsed url query
    const parsedQuery = queryParse(req.query);

    //database query
    mysqlDb.query(
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
      ${parsedQuery.offset}`,
      res
    );
  },

  //POST: /:baseTable/:baseId/:targetTable
  post: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    //database query
    mysqlDb.query(
      `INSERT INTO ${escaped.tableName} 
      (${escaped.columns.join(", ")}) 
      VALUES(${escaped.rows.join(", ")})`,
      res
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
      `SELECT ${parsedQuery.fields}
      FROM ${escaped.tableName}
	    INNER JOIN ${escaped.targetTable}
      ON ${escaped.targetTable}.${escaped.targetIdField}= ${escaped.tableName}.${escaped.targetIdField}
      INNER JOIN ${escaped.baseTable}
	    ON ${escaped.baseTable}.${escaped.baseIdField}= ${escaped.tableName}.${escaped.baseIdField}
      WHERE ${escaped.tableName}.${escaped.baseIdField}=${escaped.baseId} 
      AND ${escaped.tableName}.${escaped.targetIdField}=${escaped.targetId}`,
      res
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
      `UPDATE ${escaped.tableName} 
  	  SET ${pairs.join(", ")} 
  	  WHERE ${escaped.baseIdField} = ${escaped.baseId} 
      AND ${escaped.targetIdField} = ${targetId}`,
      res
    );
  },

  //DELETE /:baseTable/:baseId/:targetTable/:targetId
  delete: (req, res) => {
    //calls a helper to help parse the request
    const escaped = escapeReq(req);

    //database query and response
    mysqlDb.query(
      `DELETE FROM ${escaped.tableName} 
	    WHERE ${escaped.baseIdField} = ${escaped.baseId} 
  	  AND ${escaped.targetIdField} = ${targetId}`,
      res
    );
  }
};
