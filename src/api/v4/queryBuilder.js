sqlstring = require("sqlstring");

class queryBuilder {
  constructor() {
    this.sql = "";
  }

  /**
   *
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
   *
   */
  from(table) {
    this.sql += `\nFROM ${sqlstring.escapeId(table)} a`;
    return this;
  }

  /**
   *
   */
  deleteFrom(table) {
    this.sql += `\nDELETE FROM ${sqlstring.escapeId(table)} a`;
    return this;
  }

  /**
   *
   */
  insertInto(table) {
    this.sql += `\nINSERT INTO ${sqlstring.escapeId(table)}`;
    return this;
  }

  /**
   *
   */
  update(table) {
    this.sql += `\nUPDATE ${sqlstring.escapeId(table)}`;
    return this;
  }

  /**
   *
   */
  set(changes) {
    this.sql += sqlstring.format(" SET ?", changes);
    return this;
  }

  /**
   * takes a JSON
   * {
   *    type: (inner, left, right, full)
   *    table: (table b to be joined)
   *    aColumn: (column from table a to join on)
   *    bColumn: (column from table b to join on)
   * }
   */
  join(join) {
    if (join) this.sql += `\n${joinBuilder(join)}`;
    return this;
  }

  /**
   *
   */
  where(conditions) {
    if (!conditions) return this;
    let out = whereBuilder(conditions);
    if (out.length) this.sql += `\nWHERE ${out}`;
    return this;
  }

  /**
   *
   */
  and(conditions) {
    if (!conditions) return this;
    let out = whereBuilder(conditions);
    if (out.length) this.sql += ` AND ${out}`;
    return this;
  }

  or(conditions) {
    if (!conditions) return this;
    let out = whereBuilder(conditions);
    if (out.length) this.sql += ` OR ${out}`;
    return this;
  }

  in(values) {
    if (!Array.isArray(values)) values = values.split(",");
    values = values.map(el => sqlstring.escapeId(el)).join(",");
    this.sql += ` IN (${values})`;
  }

  /**
   *
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
   *
   */
  limit(limit) {
    if (limit) this.sql += `\nLIMIT ${parseInt(limit)}`;
    return this;
  }

  /**
   *
   */
  offset(offset) {
    if (offset) this.sql += `\nOFFSET ${parseInt(offset)}`;
    return this;
  }
}

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

const builder = () => new queryBuilder();
module.exports = builder;
