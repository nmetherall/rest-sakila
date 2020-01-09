const mysql = require("mysql");
const mysqlDb = require("../../../mysqlConnection");
const queryParse = require("../urlQueryParser");

const uP = require("../urlParse");
const qB = require("../queryBuilder");

//method that takes requests and returns the params as mysql escaped strings
const escapeReq = req => {
  const hasBody = !!req.body.length;
  return {
    table: mysql.escapeId(req.params.table),
    idField: mysql.escapeId(`${req.params.table}_id`),
    id: mysql.escape(req.params.id),
    columns: hasBody
      ? Object.keys(req.body).map(el => mysqlDb.escapeId(el))
      : "",
    rows: hasBody ? Object.values(req.body).map(el => mysqlDb.escape(el)) : ""
  };
};

module.exports = {
  //GET /:table
  getAll: (req, res) => {
    let urlQuery = uP(req.query);
    let sql = qB
      .builder()
      .select(urlQuery.fields)
      .from(req.params.table)
      .where(urlQuery.columns)
      .orderBy(urlQuery.orderBy)
      .limit(urlQuery.limit)
      .offset(urlQuery.offset).sql;
    mysqlDb.query(res, sql);
  },

  //POST /:table
  post: (req, res) => {
    //escaped values from request
    const escaped = escapeReq(req);

    //database query and response
    mysqlDb.query(
      res,
      `INSERT INTO ${escaped.table} 
      (${escaped.columns.join(", ")}) 
      VALUES(${escaped.rows.join(", ")})`
    );
  },

  //GET /:table/:id
  get: (req, res) => {
    //escaped table name, id field, and id number
    const escaped = escapeReq(req);

    //json object of a parsed url query
    const parsedQuery = queryParse(req.query);

    //database query and response
    mysqlDb.query(
      res,
      `SELECT ${parsedQuery.fields} FROM ${escaped.table} 
      WHERE ${escaped.idField} = ${escaped.id}`
    );
  },

  //PUT /:table/:id
  put: (req, res) => {
    //escaped values from request
    const escaped = escapeReq(req);

    const rows = escaped.rows;
    //keys and values are formated and mapped to an array
    const pairs = escaped.columns.map((el, index) => {
      return `${el}=${rows[index]}`;
    });

    //database query and response
    mysqlDb.query(
      res,
      `UPDATE ${escaped.table} 
      SET ${pairs.join(", ")} 
      WHERE ${escaped.idField} = ${escaped.id}`
    );
  },

  //DELETE /:table/:id
  delete: (req, res) => {
    //escaped table name, id field, and id number
    const escaped = escapeReq(req);

    //database query and response
    mysqlDb.query(
      res,
      `DELETE FROM ${escaped.table} 
      WHERE ${escaped.idField} = ${escaped.id}`
    );
  }
};
