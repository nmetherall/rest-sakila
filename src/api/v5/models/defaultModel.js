const mysqlDb = require("../../../mysqlConnection");

const uP = require("../urlParse");
const qB = require("simple-query-limn");

module.exports = {
  //GET /:table
  getAll: (req, res) => {
    let urlQuery = uP(req.query);
    let builder = qB()
      .select(urlQuery.fields)
      .from(req.params.table)
      .where(urlQuery.conditions)
      .orderBy(urlQuery.orderBy)
      .limit(urlQuery.limit)
      .offset(urlQuery.offset);
    mysqlDb.query(builder.sql, res);
  },

  //POST /:table
  post: (req, res) => {
    let builder = qB()
      .insertInto(req.params.table)
      .set(req.body);
    mysqlDb.query(builder.sql, res);
  },

  //GET /:table/:id
  get: (req, res) => {
    let urlQuery = uP(req.query);
    let builder = qB()
      .select(urlQuery.fields)
      .from(req.params.table)
      .where({
        column: `${req.params.table}_id`,
        value: req.params.id
      });
    mysqlDb.query(builder.sql, res);
  },

  //PUT /:table/:id
  put: (req, res) => {
    let builder = qB()
      .update(req.params.table)
      .set(req.params.body)
      .where({
        column: `${req.params.table}_id`,
        value: req.params.id
      });
    mysqlDb.query(builder.sql, res);
  },

  //DELETE /:table/:id
  delete: (req, res) => {
    let builder = qB()
      .deleteFrom(req.params.table)
      .where({
        column: `${req.params.table}_id`,
        value: req.params.id
      });
    mysqlDb.query(builder.sql, res);
  }
};
