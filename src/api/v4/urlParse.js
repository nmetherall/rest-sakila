//Takes an express req.query and returns a json of useful key: value pairs

const urlParse = url => {
  let out = {};

  if (url._fields) {
    if (Array.isArray(url._fields)) url._fields = url._fields.join(",");
    out.fields = url._fields;
  }
  delete url._fields;

  if (url._limit) {
    if (Array.isArray(url._limit))
      throw new TooManyArgumentsError("_limit can only take one argument");
    let limit = parseInt(url._limit);
    if (isNaN(limit)) throw new TypeError(`Integer expected for _limit.`);
    out.limit = limit;
  }
  delete url._limit;

  if (url._offset) {
    if (Array.isArray(url._offset))
      throw new TooManyArgumentsError(`_offset can only take one argument`);
    let offset = parseInt(url._offset);
    if (isNaN(offset)) throw new TypeError(`Integer expected for _offset.`);
    out.offset = offset;
  }
  delete url._offset;

  if (url._orderBy) {
    if (Array.isArray(url._orderBy)) url._orderBy = url._orderBy.join(",");
    out.orderBy = [];
    url._orderBy
      .split(",")
      .forEach(val => out.orderBy.push(orderByHelper(val)));
    delete url._orderBy;
  }

  out.conditions = [];
  Object.keys(url).map(key => {
    if (Array.isArray(url[key]))
      url[key].forEach(val => out.conditions.push(conditionsHelper(key, val)));
    else out.conditions.push(conditionsHelper(key, url[key]));
  });
  return out;
};

//
////
//HELPERS
const conditionsHelper = (key, val) => {
  const opVal = val.split(":");
  console.log();
  return {
    column: key,
    operator: opVal.length != 1 ? opVal[0] : "=",
    value: opVal.length != 1 ? opVal[1] : opVal[0]
  };
};

const orderByHelper = val => {
  const opVal = val.split(":");
  return {
    column: opVal[0],
    order: opVal[1]
  };
};

//
////
//ERRORS
class TooManyArgumentsError extends Error {
  constructor(message) {
    super(message);
    this.name = "TooManyArgumentsError";
  }
}

module.exports = urlParse;
