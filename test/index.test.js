/* eslint-env mocha */

const chai = require('chai')
const expect = chai.expect

describe('index', function () {
  it('should export required properties and functions', () => {
    const provider = require('../index')

    expect(provider.type).to.equal('provider')
    expect(provider.name).to.equal('redshift-analytics')
    expect(provider.Model).to.be.a('function')
  })
})
