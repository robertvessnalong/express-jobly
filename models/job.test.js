'use strict';

const { NotFoundError, BadRequestError } = require('../expressError');
const db = require('../db');
const Job = require('./job');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** get */

describe('Get', () => {
  test('Get Job', async () => {
    const job = await Job.get(jobIds[0]);
    expect(job).toEqual({
      id: jobIds[0],
      title: 'testOne',
      salary: 100,
      equity: '0.1',
      company: {
        handle: 'c1',
        name: 'C1',
        description: 'Desc1',
        numEmployees: 1,
        logoUrl: 'http://c1.img',
      },
    });
  });
});

/************************************** findAll */

describe('findAll', () => {
  test('Get All', async () => {
    const jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: 'testOne',
        salary: 100,
        equity: '0.1',
        companyHandle: 'c1',
        companyName: 'C1',
      },
      {
        id: jobIds[1],
        title: 'testTwo',
        salary: 200,
        equity: '0.3',
        companyHandle: 'c1',
        companyName: 'C1',
      },
      {
        id: jobIds[2],
        title: 'testThree',
        salary: 300,
        equity: '0.5',
        companyHandle: 'c1',
        companyName: 'C1',
      },
    ]);
  });
});

/************************************** filter */

describe('filter', () => {
  test('Filter By Title', async () => {
    const jobs = await Job.filter({ title: 'testT' });
    expect(jobs).toEqual([
      {
        id: jobIds[2],
        title: 'testThree',
        salary: 300,
        equity: '0.5',
        companyHandle: 'c1',
        companyName: 'C1',
      },
      {
        id: jobIds[1],
        title: 'testTwo',
        salary: 200,
        equity: '0.3',
        companyHandle: 'c1',
        companyName: 'C1',
      },
    ]);
  });

  test('Filter By All', async () => {
    const jobs = await Job.filter({
      title: 'test',
      minSalary: 150,
      hasEquity: true,
    });
    expect(jobs).toEqual([
      {
        id: jobIds[2],
        title: 'testThree',
        salary: 300,
        equity: '0.5',
        companyHandle: 'c1',
        companyName: 'C1',
      },
      {
        id: jobIds[1],
        title: 'testTwo',
        salary: 200,
        equity: '0.3',
        companyHandle: 'c1',
        companyName: 'C1',
      },
    ]);
  });

  test('Filter By minSalary', async () => {
    const jobs = await Job.filter({ minSalary: 200 });
    expect(jobs).toEqual([
      {
        id: jobIds[2],
        title: 'testThree',
        salary: 300,
        equity: '0.5',
        companyHandle: 'c1',
        companyName: 'C1',
      },
      {
        id: jobIds[1],
        title: 'testTwo',
        salary: 200,
        equity: '0.3',
        companyHandle: 'c1',
        companyName: 'C1',
      },
    ]);
  });
});

/************************************** create */

describe('Create', () => {
  const jobOne = {
    companyHandle: 'c1',
    title: 'Test',
    salary: 200,
    equity: '0.1',
  };

  test('Create a job', async () => {
    const job = await Job.create(jobOne);
    expect(job).toEqual({
      ...jobOne,
      id: expect.any(Number),
    });
  });
});

/************************************** update */

describe('Update', () => {
  let updateJob = {
    title: 'Update',
    salary: 500,
    equity: '0.5',
  };
  test('Update a Job', async () => {
    const job = await Job.update(jobIds[0], updateJob);
    expect(job).toEqual({
      id: jobIds[0],
      title: 'Update',
      salary: 500,
      equity: '0.5',
      companyHandle: 'c1',
    });
  });
});

/************************************** remove */

describe('Remove', () => {
  test('Remove Job', async () => {
    await Job.removeJob(jobIds[0]);
    const res = await db.query(
      `
        SELECT id FROM jobs WHERE id=$1
        `,
      [jobIds[0]]
    );
    expect(res.rows.length).toEqual(0);
  });
});
