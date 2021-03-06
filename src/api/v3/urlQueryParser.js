//Function to parse a query from the url and return values to be used in an SQL query

const mysqlDb = require("../../mysqlConnection");
const db = mysqlDb.database;

//takes a url query and parses it for sql commands
function urlQueryParser(query) {
  let fields = "*";
  let where = [];
  let orderBy;
  let limit, offset;

  const keys = Object.keys(query);
  const values = Object.values(query);

  //switch statement checking for reserved keys
  //default assume a column name and value were passed for where
  keys.forEach((key, index) => {
    switch (key) {
      case "_fields":
        fields = createFields(values[index]);
        break;
      case "_sortBy":
        orderBy = createSortBy(values[index]);
        break;
      case "_limit":
        limit = `LIMIT ${parseInt(values[index])}`;
        break;
      case "_offset":
        offset = `OFFSET ${parseInt(values[index])}`;
        break;
      default:
        where = where.concat(createWhere(key, values[index]));
        break;
    }
  });

  //object containing usedful fields for sql queries based on the url query
  return {
    fields: fields ? fields : "",
    limit: limit ? limit : "",
    offset: offset ? offset : "",
    orderBy: orderBy ? orderBy : "",
    where: where.length ? `${where.join(" AND ")}` : ""
  };
}

/*
takes a string of params delimited by commas 
and returns the string where each field name has been escaped
 */
function createFields(fields) {
  return fields
    .split(",")
    .map(el => db.escapeId(el))
    .join(",");
}

/*
creates the ORDER BY arguments for an sql query. 
Takes a string of comma delimited params which may have a qualifier attached 
ex. 'table_name:asc'
*/
function createSortBy(params) {
  console.log(params);
  return params
    .split(",")
    .map(el => {
      let split = el.split(":");
      return `${db.escapeId(split[0])} ${
        split[1] ? split[1].toUpperCase() : ""
      }`;
    })
    .join(",");
}

/*
builds an array strings which can be joined to create a WHERE query
returns a string in the format '{escaped column} {operator} {escaped value}' 
ex. '`table` >= `10`'
*/
function createWhere(key, values) {
  //if multiple values where passed
  if (Array.isArray(values))
    return values.map(el => {
      return `${db.escapeId(key)} ${operatorValueParse(el)}`;
    });
  //if a single value is passed
  return `${db.escapeId(key)} ${operatorValueParse(values)}`;
}

/*
takes a value which may contain an operator in addition to the value 
and returns both as a string in the proper format
*/
function operatorValueParse(input) {
  //splits the operator and the value on the ':' character
  let opValSplit = input.split(":");
  //checks if an operator was passed
  //if not returns an escaped version of the input
  //if it was returns a string in the format '{operator} {escaped value}' ex. '<> `dog`'
  return opValSplit.length === 1
    ? `= ${db.escape(input)}`
    : `${inputToOperator(opValSplit[0])} ${db.escape(opValSplit[1])}`;
}

//takes and input and returns the ocrresponding sql operator
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
    case "nl":
      operator = "NOT LIKE";
      break;
    default:
      operator = "=";
      break;
  }
  return operator;
}

module.exports = urlQueryParser;
