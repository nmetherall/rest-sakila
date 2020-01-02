const mysql = require('mysql');
const mysqlDb = require("../../../mysqlConnection");
const queryParse = require("../urlQueryParser");

//method that takes requests and returns the params as mysql escaped strings
const escapeReq = (req)=>{
  const hasBody = !!req.body.length;
  const table = req.params.table;
  const id = req.params.id;
  return{
    table: table ? mysql.escapeId(req.params.table) : '',
    idField: table ? mysql.escapeId(`${req.params.table}_id`): '',
    id: id ? mysql.escape(req.params.id): '',
    columns: hasBody ? Object.keys(req.body).map(el => mysqlDb.escapeId(el)) : '',
    rows : hasBody ? Object.values(req.body).map(el => mysqlDb.escape(el)) : ''
  }
}

module.exports = {
  //GET /:table
  getAll: (req,res)=>{
    //escaped table name
    const table = mysql.escapeId(req.params.table);
  
    //json object of a parsed url query
    const parsedQuery = queryParse(req.query);
  
    //database query and response
    mysqlDb.query(res,
      `SELECT ${parsedQuery.fields} FROM ${table}
      ${parsedQuery.where ? `WHERE ${parsedQuery.where}` : ""}
      ${parsedQuery.orderBy ? `ORDER BY ${parsedQuery.orderBy}` : ""}
      ${parsedQuery.limit}
      ${parsedQuery.offset}`
    );
  },   

  //POST /:table
  post: (req,res)=>{
    //escaped values from request
    const escaped = escapeReq(req);

    //database query and response
    mysqlDb.query(res,
      `INSERT INTO ${escaped.table} 
      (${escaped.columns.join(", ")}) 
      VALUES(${escaped.rows.join(", ")})`
    );
  },

    
  //GET /:table/:id
  get: (req,res)=>{
    //escaped table name, id field, and id number
    const escaped = escapeReq(req);
  
    //json object of a parsed url query
    const parsedQuery = queryParse(req.query);
  
    //database query and response
    mysqlDb.query(res,
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
    mysqlDb.query(res,
      `UPDATE ${escaped.table} 
      SET ${pairs.join(", ")} 
      WHERE ${escaped.idField} = ${escaped.id}`
    );
  },
  
  //DELETE /:table/:id
  delete: (req,res)=>{
    //escaped table name, id field, and id number
    const escaped = escapeReq(req);

    //database query and response
    mysqlDb.query(res,
      `DELETE FROM ${escaped.table} 
      WHERE ${escaped.idField} = ${escaped.id}`
    );
  }
};
