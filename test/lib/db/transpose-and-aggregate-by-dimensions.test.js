/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire')
const modulePath = '../../../lib/db/transpose-and-aggregate-by-dimensions'
const transposeAndAggregateByDimensions = proxyquire(modulePath, {
  'config': { // eslint-disable-line
    koopProviderRedshiftAnalytics: {
      metricLookup: {
        views: 'pageView'
      },
      dimensionLookup: {
        userType: 'dimension_1'
      }
    }
  }
})

describe('transposeAndAggregateByDimesnions', () => {
  it('should transpose and aggregate with time-dimension as aggregation key', () => {
    const data = [
      { timestamp: new Date(2020, 1, 1), userType: 'admin', pageView: '100' },
      { timestamp: new Date(2020, 1, 1), userType: 'member', pageView: '51' },
      { timestamp: new Date(2020, 1, 2), userType: 'admin', pageView: '99' },
      { timestamp: new Date(2020, 1, 2), userType: 'public', pageView: '21' }
    ]

    const result = transposeAndAggregateByDimensions({ data, metric: 'pageView', dimensions: ['userType', 'day'], timeDimension: 'day' })
    expect(result).to.deep.equal([
      { timestamp: new Date(2020, 1, 1), admin: 100, member: 51, public: 0 },
      { timestamp: new Date(2020, 1, 2), admin: 99, member: 0, public: 21 }
    ])
  })

  it('should transpose and aggregate with non-time-dimension as aggregation key', () => {
    const data = [
      { a_hostname: 'hub.com', userType: 'admin', pageView: '100' },
      { a_hostname: 'hub.com', userType: 'member', pageView: '51' },
      { a_hostname: 'koop.com', userType: 'admin', pageView: '99' },
      { a_hostname: 'koop.com', userType: 'public', pageView: '21' }
    ]

    const result = transposeAndAggregateByDimensions({ data, metric: 'pageView', dimensions: ['userType', 'a_hostname'] })
    expect(result).to.deep.equal([
      { a_hostname: 'hub.com', admin: 100, member: 51, public: 0 },
      { a_hostname: 'koop.com', admin: 99, member: 0, public: 21 }
    ])
  })

  it('should transpose and aggregate and handle empty strings', () => {
    const data = [
      { a_hostname: 'hub.com', userType: '', pageView: '100' },
      { a_hostname: 'hub.com', userType: 'member', pageView: '51' },
      { a_hostname: 'koop.com', userType: 'admin', pageView: '99' },
      { a_hostname: 'koop.com', userType: 'public', pageView: '21' }
    ]

    const result = transposeAndAggregateByDimensions({ data, metric: 'pageView', dimensions: ['userType', 'a_hostname'] })
    expect(result).to.deep.equal([
      { a_hostname: 'hub.com', admin: 0, emptyString: 100, member: 51, public: 0 },
      { a_hostname: 'koop.com', admin: 99, emptyString: 0, member: 0, public: 21 }
    ])
  })
})
