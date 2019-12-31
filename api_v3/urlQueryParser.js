//Function to parse a query from the url and return it as an SQL query
//TODO: COMMENT EVERYTHING

const mysqlDb = require("../mysqlConnection");
const db = mysqlDb.database;

function urlQueryParser(query) {
  let fields = "*";
  let where = [];
  let limit, offset;
  let orderBy;

  const keys = Object.keys(query);
  const values = Object.values(query);

  keys.forEach((key, index) => {
    switch (key) {
      case "_fields":
        fields = createFields(values[index]);
        break;
      case "_limit":
        limit = `LIMIT ${parseInt(values[index])}`;
        break;
      case "_offset":
        offset = `OFFSET ${parseInt(values[index])}`;
        break;
      case "_sortBy":
        orderBy = createSortBy(values[index]);
        break;
      default:
        where = where.concat(createWhere(key, values[index]));
        break;
    }
  });

  return {
    fields: fields ? fields : "",
    limit: limit ? limit : "",
    offset: offset ? offset : "",
    orderBy: orderBy ? orderBy : "",
    where: where.length ? `${where.join(" AND ")}` : ""
  };
}

function createFields(fields) {
  return fields
    .split(",")
    .map(el => db.escapeId(el))
    .join(",");
}

function createSortBy(params) {
  return params
    .split(",")
    .map(el => {
      let split = el.split(".");
      return `${db.escapeId(split[0])} ${split[1].toUpperCase()}`;
    })
    .join(",");
}

function createWhere(key, values) {
  const keyOpSplit = key.split(".");
  const keyOp = `${db.escapeId(keyOpSplit[0])} ${inputToOperator(
    keyOpSplit[1]
  )}`;
  if (Array.isArray(values))
    return values.map(el => `${keyOp} ${db.escape(el)}`);
  return [`${keyOp} ${db.escape(values)}`];
}

function inputToOperator(input) {
  let operator;
  switch (input) {
    case "gt":
      operator = ">";
      break;
    case "lt":
      operator = "<";
      break;
    case "gte":
      operator = ">=";
      break;
    case "lte":
      operator = "<=";
      break;
    case "ne":
      operator = "<>";
      break;
    case "like":
      operator = "LIKE";
      break;
    case "notlike":
      operator = "NOT LIKE";
      break;
    default:
      operator = "=";
      break;
  }
  return operator;
}

module.exports = urlQueryParser;
