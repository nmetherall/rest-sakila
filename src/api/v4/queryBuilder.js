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
      fields = fields
        .split(",")
        .map(el => sqlstring.escapeId(el))
        .join(",");
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
  join(join) {
    if (join) this.sql += `\n${joinBuilder(join)}`;
    return this;
  }

  /**
   *
   */
  where(conditions) {
    const out = conditions
      .map(el => {
        const column = sqlstring.escapeId(el.column);
        const operator = getOperator(el.operator);
        const value = sqlstring.escape(el.value);

        return `${column} ${operator} ${value}`;
      })
      .join(" AND ");
    if (out.length) this.sql += `\nWHERE${out}`;
    return this;
  }

  /**
   *
   */
  orderBy(orderBy) {
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
  sqlstring.format(
    `${type}JOIN ? b ON a.? = b.?`,
    join.table,
    join.aColumn,
    join.bColumn
  );
};

module.exports = { builder: () => new queryBuilder() };
