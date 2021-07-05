'use strict';

const db = require('../db');
const jsonschema = require('jsonschema');
const { BadRequestError, NotFoundError } = require('../expressError');
const { sqlForPartialUpdate } = require('../helpers/sql');
const { query } = require('express');
const jobFilterSchema = require('../schemas/jobFilter.json');

class Job {
  /*
   * Create a new job, update db, and return new job data
   *
   * Needed Data:
   * data = { title, salary, equity, companyHandle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   */

  static async create(data) {
    const result = await db.query(
      `
        INSERT INTO jobs (title,
                            salary,
                            equity,
                            company_handle)
        VALUES ($1, $2, $3, $4)
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"
        `,
      [data.title, data.salary, data.equity, data.companyHandle]
    );

    let job = result.rows[0];

    return job;
  }

  /*
   * Update Job
   *
   * Possible Data:
   * data = { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const indexId = '$' + (values.length + 1);

    const querySql = `UPDATE jobs
                      SET ${setCols}
                      WHERE id = ${indexId}
                      RETURNING id,
                                title,
                                salary,
                                equity,
                                company_handle AS "companyHandle"
    `;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
    return job;
  }

  /*
   * Return Job Details from ID
   *
   * Returns { id, title, salary, equity, companyHandle, company: {handle, name, description, numEmployees, logoUrl} }
   */

  static async get(id) {
    const result = await db.query(
      `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`,
      [id]
    );
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No Job Found: ${id}`);

    const company = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
        FROM companies
        WHERE handle = $1`,
      [job.companyHandle]
    );

    delete job.companyHandle;
    job.company = company.rows[0];
    return job;
  }

  /*
   * Find All Jobs
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }]
   */

  static async findAll() {
    const result = await db.query(`SELECT j.id,
                            j.title,
                            j.salary,
                            j.equity,
                            j.company_handle AS "companyHandle",
                            c.name AS "companyName"
                    FROM jobs j
                        LEFT JOIN companies AS c ON c.handle = j.company_handle              
      `);
    const jobs = result.rows;
    return jobs;
  }

  /*
   * Find By Query
   *
   * Returns [{ id, title, salary, equity, companyHandle, companyName }]
   */

  static async filter(queryData) {
    const validator = jsonschema.validate(queryData, jobFilterSchema);
    if (!validator.valid) {
      let listOfErrors = validator.errors.map((error) => error.stack);
      throw new BadRequestError(listOfErrors, 400);
    }
    const { title, minSalary, hasEquity } = queryData;
    let queryString = `SELECT j.id,
                              j.title,
                              j.salary,
                              j.equity,
                              j.company_handle AS "companyHandle",
                              c.name AS "companyName"
                        FROM jobs j
                        LEFT JOIN companies AS c ON c.handle = j.company_handle
                      `;
    const values = [];
    if (title) {
      values.push(`%${title}%`);
      queryString += `WHERE title LIKE $${values.length} `;
    }
    const selector = title ? 'AND' : 'WHERE';
    if (hasEquity == true) {
      queryString += `${selector} equity > 0 `;
    }
    if (minSalary !== undefined) {
      values.push(`${minSalary}`);
      queryString += `${selector} salary >= $${values.length} `;
    }
    queryString += 'ORDER BY title';
    const companyRes = await db.query(queryString, values);
    const company = companyRes.rows;

    if (company.length == 0)
      throw new NotFoundError(`No company matched that query`);

    return company;
  }

  /*
   * Delete give job id from database
   *
   */

  static async removeJob(id) {
    const result = await db.query(
      ` DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`,
      [id]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No Job Found: ${id}`);
  }
}

module.exports = Job;
