const mysqlDb = require("../../../mysqlConnection");

const uP = require("../urlParse");
const qB = require("../queryBuilder");

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
  return tableName;
};

module.exports = {
  /**
   * GET /:baseTable/:baseId/:targetTable
   * Responds with all records from the target table that belong to the base table.
   * @param {json} req  the request from the express http request
   * @param {json} res  the respons for the express http
   */
  getAll: (req, res) => {
    const table = checkTableName(req);
    const urlParse = uP(req.query);

    const builder = qB()
      .select(urlParse.fields)
      .from(table)
      .join({
        table: req.params.targetTable,
        onColumn: `${req.params.targetTable}_id`
      })
      .where({
        column: `a.${req.params.baseTable}_id`,
        value: req.params.baseId
      })
      .and(urlParse.conditions)
      .orderBy(urlParse.orderBy)
      .limit(urlParse.limit)
      .offset(urlParse.offset);

    mysqlDb.query(builder.sql, res);
  },

  //POST: /:baseTable/:baseId/:targetTable
  post: (req, res) => {
    const table = checkTableName(req);

    const builder = qB()
      .insertInto(table)
      .set(req.body);
    mysqlDb.query(builder.sql, res);
  },

  //GET /:baseTable/:baseId/:targetTable/:targetId
  get: (req, res) => {
    res.redirect(
      301,
      `../../../${req.params.targetTable}/${req.params.targetId}`
    );
  },

  //PUT /:baseTable/:baseId/:targetTable/:targetId
  put: (req, res) => {
    const table = checkTableName(req);

    const builder = qB()
      .update(table)
      .set(req.body)
      .where({
        column: `${req.params.baseTable}_id`,
        value: req.params.baseId
      })
      .and({
        column: `${req.params.targetTable}_id`,
        value: req.params.targetId
      });

    mysqlDb.query(builder.sql, res);
  },

  //DELETE /:baseTable/:baseId/:targetTable/:targetId
  delete: (req, res) => {
    const table = checkTableName(req);

    const builder = qB()
      .deleteFrom(table)
      .where({
        column: `${req.params.baseTable}_id`,
        value: req.params.baseId
      })
      .and({
        column: `${req.params.targetTable}_id`,
        value: req.params.targetId
      });

    mysqlDb.query(builder.sql, res);
  }
};
