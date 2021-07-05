'use strict';

/** Routes for jobs. */

const jsonschema = require('jsonschema');

const express = require('express');
const { BadRequestError } = require('../expressError');
const { isAdmin } = require('../middleware/auth');
const Job = require('../models/job');
const jobNewSchema = require('../schemas/jobNew.json');
const jobUpdateSchema = require('../schemas/jobUpdate.json');
const jobFilterSchema = require('../schemas/jobFilter.json');

const router = express.Router({ mergeParams: true });

/** POST
 * Required Data
 * Data = { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.post('/', isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobNewSchema);
    if (!validator.valid) {
      const err = validator.errors.map((e) => e.stack);
      throw new BadRequestError(err);
    }

    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** GET /
 *
 * Returns { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 * Can Filter By Sending Data
 * Filter Data = {hasEquity [Boolean], minSalary: [Int], title: [String]}
 *
 * Authorization required: none
 */

router.get('/', async function (req, res, next) {
  try {
    if (Object.keys(req.query).length != 0) {
      const jobs = await Job.filter(req.query);
      return res.json({ jobs });
    } else {
      const jobs = await Job.findAll();
      return res.json({ jobs });
    }
  } catch (err) {
    return next(err);
  }
});

/** GET /id
 *
 * Return Data = { id, title, salary, equity, company }
 *  - company = { handle, name, description, numEmployees, logoUrl }
 * Authorization required: none
 */

router.get('/:id', async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /id
 *
 * Possible Data
 * Data = { title, salary, equity }
 * Return Data
 * Return Data = { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */

router.patch('/:id', isAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, jobUpdateSchema);
    if (!validator.valid) {
      const err = validator.errors.map((e) => e.stack);
      throw new BadRequestError(err);
    }

    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /id
 *
 * Authorization required: admin
 */

router.delete('/:id', isAdmin, async function (req, res, next) {
  try {
    await Job.removeJob(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
