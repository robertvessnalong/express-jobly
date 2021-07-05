'use strict';

const request = require('supertest');

const app = require('../app');

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds,
  u1Token,
  u2Token,
} = require('./_testCommon');

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe('POST /jobs', () => {
  test('Create Job', async () => {
    const newJob = {
      companyHandle: 'c1',
      title: 'newJob',
      salary: 500,
      equity: '0.4',
    };
    const resp = await request(app)
      .post(`/jobs`)
      .send(newJob)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'newJob',
        salary: 500,
        equity: '0.4',
        companyHandle: 'c1',
      },
    });
  });

  test('Fail Job Post', async () => {
    const newJob = {
      companyHandle: 'c1',
      title: 'newJob',
      salary: 500,
      equity: '0.4',
    };
    const resp = await request(app)
      .post(`/jobs`)
      .send(newJob)
      .set('authorization', `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
    expect(resp.body).toEqual({
      error: { message: 'Unauthorized', status: 401 },
    });
  });
});

/************************************** GET /jobs */

describe('GET /jobs', () => {
  test('Find All Jobs', async () => {
    const resp = await request(app).get(`/jobs`);
    expect(resp.body).toEqual({
      jobs: [
        {
          id: jobIds[0],
          title: 'jobOne',
          salary: 100,
          equity: '0.3',
          companyHandle: 'c1',
          companyName: 'C1',
        },
        {
          id: jobIds[1],
          title: 'jobTwo',
          salary: 200,
          equity: '0.4',
          companyHandle: 'c1',
          companyName: 'C1',
        },
        {
          id: jobIds[2],
          title: 'jobThree',
          salary: 300,
          equity: '0.5',
          companyHandle: 'c1',
          companyName: 'C1',
        },
      ],
    });
  });

  test('Filter By Name', async () => {
    const queryData = { name: 'jobT' };
    const resp = await request(app).get(`/jobs`).query(queryData);
    console.log(resp.body);
    // expect(resp.body).toEqual({
    //   jobs: [
    //     {
    //       id: jobIds[2],
    //       title: 'jobThree',
    //       salary: 300,
    //       equity: '0.5',
    //       companyHandle: 'c1',
    //       companyName: 'C1',
    //     },
    //     {
    //       id: jobIds[1],
    //       title: 'jobTwo',
    //       salary: 200,
    //       equity: '0.4',
    //       companyHandle: 'c1',
    //       companyName: 'C1',
    //     },
    //   ],
    // });
  });

  test('Filter By All ', async () => {
    const resp = await request(app)
      .get(`/jobs`)
      .query({ minSalary: 250, hasEquity: true, title: 'jobT' });
    // expect(resp.body).toEqual({
    //   jobs: [
    //     {
    //       id: jobIds[2],
    //       title: 'jobThree',
    //       salary: 300,
    //       equity: '0.5',
    //       companyHandle: 'c1',
    //       companyName: 'C1',
    //     },
    //   ],
    // });
  });
});

/************************************** GET /jobs/:id */

describe('GET /jobs/:id', () => {
  test('Get by ID', async () => {
    const resp = await request(app).get(`/jobs/${jobIds[0]}`);
    expect(resp.body).toEqual({
      job: {
        id: jobIds[0],
        title: 'jobOne',
        salary: 100,
        equity: '0.3',
        company: {
          handle: 'c1',
          name: 'C1',
          description: 'Desc1',
          numEmployees: 1,
          logoUrl: 'http://c1.img',
        },
      },
    });
  });
});

/************************************** PATCH /jobs/:id */

describe('PATCH /jobs/:id', () => {
  test('Update Admin', async () => {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        title: 'patchTest',
      })
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: 'patchTest',
        salary: 100,
        equity: '0.3',
        companyHandle: 'c1',
      },
    });
  });

  test('Update Non Admin', async () => {
    const resp = await request(app)
      .patch(`/jobs/${jobIds[0]}`)
      .send({
        title: 'patchTest',
      })
      .set('authorization', `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** DELETE /jobs/:id */

describe('DELETE /jobs/:id', () => {
  test('Delete For Admin', async () => {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`)
      .set('authorization', `Bearer ${u1Token}`);
    expect(resp.body).toEqual({ deleted: jobIds[0] });
  });

  test('Delete Non Admin', async () => {
    const resp = await request(app)
      .delete(`/jobs/${jobIds[0]}`)
      .set('authorization', `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });
});
