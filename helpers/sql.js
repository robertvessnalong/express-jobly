const { BadRequestError } = require('../expressError');

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // This will grab all keys from the req.body
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError('No data');

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  /* 
  For Each Key, It will be set to it's current index + 1. 
  This will help when doing an patch update for the SQL Query
  */
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );
  /*
    setCols: This will return a seperator for each item in the array
    values: This will return the values for the data to update
  */
  return {
    setCols: cols.join(', '),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
