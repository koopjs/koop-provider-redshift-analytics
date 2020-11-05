/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const { coerce: { method: coerceMetric } } = proxyquire('../../lib/schema/metric', {
  'config': { // eslint-disable-line
    koopProviderRedshiftAnalytics: {
      metrics: ['abc', 'def'],
      metricLookup: {
        abc: 'xyz'
      }
    }
  }
})

describe('metric validation', () => {
  it('should reject invalid metric', () => {
    const { errors: [error] } = coerceMetric('not valid metric')
    expect(error).to.have.property('message', '"metric" must be one of: abc, def')
  })

  it('should allow valid metric', () => {
    const { value } = coerceMetric('def')
    expect(value).to.equal('def')
  })

  it('should allow valid metric and convert it if found in lookup', () => {
    const { value } = coerceMetric('abc')
    expect(value).to.equal('xyz')
  })
})
