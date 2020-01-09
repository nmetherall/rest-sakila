const urlParse = url => {
  let out = {};
  if (url._fields) {
    out.fields = url._fields;
    delete url._fields;
  }
  if (url._orderBy) {
    out.orderBy = url._orderBy;
    delete url._orderBy;
  }
  if (url._limit) {
    out.limit = url._limit;
    delete url._limit;
  }
  if (url._offset) {
    out.offset = url._offset;
    delete url._offset;
  }

  out.columns = [];
  Object.keys(url).map(key => {
    if (Array.isArray(url[key]))
      url[key].forEach(val => out.columns.push(columnsHelper(key, val)));
    else out.columns.push(columnsHelper(key, url[key]));
  });
  return out;
};

const columnsHelper = (key, val) => {
  const opVal = val.split(":");
  return {
    column: key,
    operator: opVal.length != 1 ? opVal[0] : "=",
    value: opVal.length != 1 ? opVal[1] : opVal[0]
  };
};

module.exports = urlParse;
