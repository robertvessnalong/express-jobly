const { sqlForPartialUpdate } = require('./sql');
const { BadRequestError } = require('../expressError');

describe('SQLForPartialUpdate', () => {
  const dataToUpdate = {
    firstName: 'Robert',
    lastName: 'Long',
    email: 'test@email.com',
  };
  const jsToSql = {
    firstName: 'first_name',
    lastName: 'last_name',
    isAdmin: 'is_admin',
  };

  test('Partial Update', function () {
    let update = sqlForPartialUpdate(dataToUpdate, jsToSql);
    expect(update).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2, "email"=$3',
      values: ['Robert', 'Long', 'test@email.com'],
    });
  });
  test('Empty Response', function () {
    try {
      sqlForPartialUpdate({}, jsToSql);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
