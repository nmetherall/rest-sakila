sqlstring = require("sqlstring");

class QueryBuilder {
  constructor() {
    this.sql = "";
  }

  /**
   * Appends an sql SELECT statement to the {String}QueryBuilder.sql
   * - Defaults to 'SELECT * ' if no fields are passed
   * @param {String | String[]} fields an array or comma delimited string of fields to show.
   * @returns {QueryBuilder} this QueryBuilder
   */
  select(fields) {
    if (fields) {
      if (!Array.isArray(fields)) fields = fields.split(",");
      fields = fields.map(el => sqlstring.escapeId(el)).join(",");
      this.sql += `SELECT ${fields}`;
    } else this.sql += "SELECT * ";
    return this;
  }

  /**
   * Appends an sql FROM statement to the {String}QueryBuilder.sql
   * @param {String} table The table being used by the sql statement.
   * @returns {QueryBuilder} this QueryBuilder
   */
  from(table) {
    this.sql += `\nFROM ${sqlstring.escapeId(table)} a`;
    return this;
  }

  /**
   * Appends an sql DELETE FROM statement to the {String}QueryBuilder.sql
   * @param {String} table The name of the table to delete data from.
   * @returns {QueryBuilder} this QueryBuilder
   */
  deleteFrom(table) {
    this.sql += `\nDELETE FROM ${sqlstring.escapeId(table)} a`;
    return this;
  }

  /**
   * Appends an sql INSERT INTO statement to the {String}QueryBuilder.sql
   * @param {String} table The name of the table to insert into.
   * @returns {QueryBuilder} this QueryBuilder
   */
  insertInto(table) {
    this.sql += `\nINSERT INTO ${sqlstring.escapeId(table)}`;
    return this;
  }

  /**
   * Appends an sql UPDATE statement to the {String}QueryBuilder.sql
   * @param {String} table The name of the table to be updated.
   * @returns {QueryBuilder} this QueryBuilder
   */
  update(table) {
    this.sql += `\nUPDATE ${sqlstring.escapeId(table)}`;
    return this;
  }

  /**
   * Appends an sql SET statement to the {String}QueryBuilder.sql
   * @param {JSON} changes A JSON object containing value pairs to be added to the database
   *  - column1: value1
   *  - column2: value2
   *  - ...
   * @returns {QueryBuilder} this QueryBuilder
   */
  set(changes) {
    this.sql += sqlstring.format(" SET ?", changes);
    return this;
  }

  /**
   * Appends an sql JOIN ON statement to the {String}QueryBuilder.sql
   * @param {JSON} join JSON object containing join parameters
   *  - type: {String} 'inner'(default) || 'left' || 'right' || 'full'
   *  - table: {String} table to JOIN to an existing .from()
   *  - onColumn: {String} column to join tables on.
   *  - onColumnA: {String} column 'a' to join tables on. if(onColumn) ignore
   *  - onColumnA: {String} column 'b' to join tables on. if(onColumn) ignore
   * @returns {QueryBuilder} this QueryBuilder
   */
  join(join) {
    if (join) this.sql += `\n${joinBuilder(join)}`;
    return this;
  }

  /**
   * Appends an sql WHERE statement to the {String}QueryBuilder.sql
   * @param {JSON | JSON[]} conditions JSON object containing info on where conditions
   *  - column: {String} column name
   *  - value: {String} value
   *  - (optional) operator: {String} ( =,<,>,<=,>=,<>,like,nl )
   * @returns {QueryBuilder} this QueryBuilder
   */
  where(conditions) {
    if (!conditions) return this;
    let out = whereBuilder(conditions);
    if (out.length) this.sql += `\nWHERE ${out}`;
    return this;
  }

  /**
   * Appends an sql AND statement to the {String}QueryBuilder.sql
   * @param {JSON | JSON[]} conditions JSON object containing info on where conditions
   *  - column: {String} column name
   *  - value: {String} value
   *  - (optional) operator: {String} ( =,<,>,<=,>=,<>,like,nl )
   * @returns {QueryBuilder} this QueryBuilder
   */
  and(conditions) {
    if (!conditions) return this;
    let out = whereBuilder(conditions);
    if (out.length) this.sql += ` AND ${out}`;
    return this;
  }

  /**
   * Appends an sql OR statement to the {String}QueryBuilder.sql
   * @param {JSON | JSON[]} conditions JSON object containing info on where conditions
   *  - column: {String} column name
   *  - value: {String} value
   *  - (optional) operator: {String} ( =,<,>,<=,>=,<>,like,nl )
   * @returns {QueryBuilder} this QueryBuilder
   */
  or(conditions) {
    if (!conditions) return this;
    let out = whereBuilder(conditions);
    if (out.length) this.sql += ` OR ${out}`;
    return this;
  }

  /**
   * Appends an sql IN statement to the {String}QueryBuilder.sql
   * @param {String | String[]} values an array or comma delimited string of values.
   * @returns {QueryBuilder} this QueryBuilder
   */
  in(values) {
    if (!Array.isArray(values)) values = values.split(",");
    values = values.map(el => sqlstring.escapeId(el)).join(",");
    this.sql += ` IN (${values})`;
    return this;
  }

  //TODO: figure out if orderBy.order is optional
  /**
   * Appends an sql ORDER BY statement to the {String}QueryBuilder.sql
   * @param {JSON | JSON[]} orderBy JSON object containing a field and order direction
   *  - column: {String} column name
   *  - order: {String} order direction ( asc || desc )
   * @returns {QueryBuilder} this QueryBuilder
   */
  orderBy(orderBy) {
    if (!orderBy) return this;
    if (!Array.isArray(orderBy)) orderBy = [orderBy];

    const out = orderBy
      .map(el => {
        const column = sqlstring.escapeId(el.column);
        const order = getOrderOperator(el.order);
        return `${column} ${order}`;
      })
      .join(", ");
    if (out.length) this.sql += `\nORDER BY ${out}`;
    return this;
  }

  /**
   * Appends an sql LIMIT statement to the {String}QueryBuilder.sql
   * @param limit the number of results to return.
   * @returns {QueryBuilder} this QueryBuilder
   */
  limit(limit) {
    if (limit) this.sql += `\nLIMIT ${parseInt(limit)}`;
    return this;
  }

  /**
   * Appends an sql OFFSET statement to the {String}QueryBuilder.sql
   * @param offset the number to offset the returned results by.
   * @returns {QueryBuilder} this QueryBuilder
   */
  offset(offset) {
    if (offset) this.sql += `\nOFFSET ${parseInt(offset)}`;
    return this;
  }
}

//HELPERS

//Method that takes a string and returns the matching sql operator
const getOperator = operator => {
  let switchOperator = operator;
  switch (switchOperator) {
    //Less Than
    case "<":
    case "lt":
      return "<";
    //Greater Than
    case ">":
    case "gt":
      return ">";
    //Less Than or Equal
    case "<=":
    case "lte":
      return "<=";
    //Greater Than or Eqaul
    case ">=":
    case "gte":
      return ">=";
    //Not Eqaul
    case "<>":
    case "ne":
      return "<>";
    //Like
    case "like":
      return "LIKE";
    //Not Like
    case "nlike":
      return "NOT LIKE";
    default:
      return "=";
  }
};

//Method that takes a string and returns the matching sql order
const getOrderOperator = operator => {
  let switchOperator = operator;
  switch (switchOperator) {
    case "desc":
    case "DESC":
      return "DESC";
    default:
      return "ASC";
  }
};

//Helper for building a where style sql statement
const whereBuilder = conditions => {
  if (!Array.isArray(conditions)) conditions = [conditions];

  return conditions
    .map(el => {
      const column = sqlstring.escapeId(el.column);
      const operator = getOperator(el.operator);
      const value = sqlstring.escape(el.value);

      return `${column} ${operator} ${value}`;
    })
    .join(" AND ");
};

//Helper for building a join sql statement
const joinBuilder = join => {
  let type;
  let joinType = join.type;
  switch (joinType) {
    case "left":
    case "LEFT":
      type = "LEFT ";
    case "right":
    case "right":
      type = "RIGHT ";
    case "full":
    case "FULL":
      type = "FULL ";
    default:
      type = "";
  }

  if (join.onColumn) join.onColumnA = join.onColumnB = join.onColumn;

  return sqlstring.format(`${type}JOIN ?? b ON a.?? = b.??`, [
    join.table,
    join.onColumnA,
    join.onColumnB
  ]);
};

const builder = () => new QueryBuilder();
module.exports = builder;
