const mysqlDb = require("../../../mysqlConnection");

const uP = require("../urlParse");
const qB = require("../queryBuilder");

module.exports = {
  //GET /:table
  getAll: (req, res) => {
    let urlQuery = uP(req.query);
    let sql = qB()
      .select(urlQuery.fields)
      .from(req.params.table)
      .where(urlQuery.conditions)
      .orderBy(urlQuery.orderBy)
      .limit(urlQuery.limit)
      .offset(urlQuery.offset).sql;
    mysqlDb.query(res, sql);
  },

  //POST /:table
  post: (req, res) => {
    let sql = qB()
      .insertInto(req.params.table)
      .set(req.body).sql;
    mysqlDb.query(res, sql);
  },

  //GET /:table/:id
  get: (req, res) => {
    let urlQuery = uP(req.query);
    let sql = qB()
      .select(urlQuery.fields)
      .from(req.params.table)
      .where({
        column: `${req.params.table}_id`,
        value: req.params.id
      }).sql;
    mysqlDb.query(res, sql);
  },

  //PUT /:table/:id
  put: (req, res) => {
    let sql = qB()
      .update(req.params.table)
      .set(req.params.body)
      .where({
        column: `${req.params.table}_id`,
        value: req.params.id
      }).sql;
    mysqlDb.query(res, sql);
  },

  //DELETE /:table/:id
  delete: (req, res) => {
    let sql = qB()
      .deleteFrom(req.params.table)
      .where({
        column: `${req.params.table}_id`,
        value: req.params.id
      }).sql;
    mysqlDb.query(res, sql);
  }
};
