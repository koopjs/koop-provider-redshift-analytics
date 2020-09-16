/* eslint-env mocha */
const proxyquire = require('proxyquire').noCallThru()
const chai = require('chai')
const expect = chai.expect
const modulePath = '../index'

describe('index', function () {
  it('should export required properties and functions', () => {
    const provider = proxyquire(modulePath, {
      './lib/model': {}
    })
    expect(provider.type).to.equal('provider')
    expect(provider.name).to.equal('koop-provider-redshift-analytics')
    expect(provider.hosts).to.equal(false)
    expect(provider.disableIdParam).to.equal(false)
    expect(provider).to.have.property('Model')
  })
})
