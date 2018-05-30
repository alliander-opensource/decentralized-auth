/**
 * Utility functions for testing.
 * @module common/test-utils
 */


const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('supertest-as-promised');

chai.use(chaiAsPromised);
const { expect } = chai;

const { app } = require('../server');
const { server } = require('../server');


module.exports = {
  app,
  server,
  expect,
  request,
};
