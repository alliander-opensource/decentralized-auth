/**
 * Utility functions for testing
 * @module common/test-utils
 */
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const request = require('supertest-as-promised');

chai.use(chaiAsPromised);
const { expect } = chai;

const { app } = require('../server');
const { server } = require('../server');

const getRandomValues = require('get-random-values');


// Insecure way to generate an IOTA seed
// SOURCE: https://www.reddit.com/r/Iota/comments/7sc62r/seed_generator_in_javascript/
const generateSeedForTestingPurposes = () => {
  const length = 81;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  const randomValues = new Uint8Array(length);
  const result = new Array(length);

  getRandomValues(randomValues);

  let cursor = 0;
  for (let i = 0; i < randomValues.length; i += 1) {
    cursor += randomValues[i];
    result[i] = chars[cursor % chars.length];
  }

  return result.join('');
};

module.exports = {
  app,
  server,
  expect,
  request,

  generateSeedForTestingPurposes,
};
