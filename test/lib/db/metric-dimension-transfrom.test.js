/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const modulePath = '../../../lib/db/metric-dimension-transform'
const metricDimensionTransform = proxyquire(modulePath, {
  'config': { // eslint-disable-line
    koopProviderRedshiftAnalytics: {
      metricLookup: {
        views: 'pageView'
      },
      dimensionLookup: {
        hostname: 'a_hostname'
      }
    }
  }
})

describe('metricDimensionTransform', () => {
  it('should convert keys found in reverse lookups', () => {
    const result = metricDimensionTransform([
      {
        pageView: 1000,
        a_hostname: 'foo',
        timestamp: 0
      }, {
        timestamp: 1
      }])
    expect(result).to.deep.equal([{
      views: 1000,
      hostname: 'foo',
      timestamp: 0
    }, {
      timestamp: 1
    }])
  })
})
