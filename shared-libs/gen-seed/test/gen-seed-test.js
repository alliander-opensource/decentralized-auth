const chai = require('chai');

const { expect } = chai;
const generateSeed = require('./../src/gen-seed');


describe('Generate seed', () => {
  it(`should generate a seed on process.platform ${process.platform}`, async () => {
    const seed = await generateSeed();

    expect(seed).to.have.lengthOf(81);
  });
});
