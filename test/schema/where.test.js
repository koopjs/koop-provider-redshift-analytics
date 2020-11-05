/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const { coerce: { method: coerceWhere } } = proxyquire('../../lib/schema/where', {
  'config': { // eslint-disable-line
    koopProviderRedshiftAnalytics: {
      metricLookup: {
        abc: 'xyz'
      },
      dimensionLookup: {
        efg: 'hij'
      }
    }
  }
})

describe('where validation', () => {
  it('should reject invalid where', () => {
    const { errors: [error] } = coerceWhere('not valid where')
    expect(error).to.have.property('message', '"where" parameter is invalid')
  })

  it('should allow a valid where', () => {
    const { value } = coerceWhere('foo=\'bar\' AND hello=\'world\'')
    expect(value).to.equal('"foo" = \'bar\' AND "hello" = \'world\'')
  })

  it('should rename metrics found in lookup', () => {
    const { value } = coerceWhere('abc=\'bar\' AND hello=\'world\'')
    expect(value).to.equal('"xyz" = \'bar\' AND "hello" = \'world\'')
  })

  it('should rename dimensions found in lookup', () => {
    const { value } = coerceWhere('efg=\'bar\' AND hello=\'world\'')
    expect(value).to.equal('"hij" = \'bar\' AND "hello" = \'world\'')
  })
})
