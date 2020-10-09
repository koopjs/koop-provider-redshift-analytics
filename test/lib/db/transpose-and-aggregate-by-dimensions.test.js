/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const transposeAndAggregateByDimensions = require('../../../lib/db/transpose-and-aggregate-by-dimensions')

describe('transposeAndAggregateByDimesnions', () => {
  it('should transpose and aggregate with time-dimension as aggregation key', () => {
    const data = [
      { timestamp: new Date(2020, 1, 1), userType: 'admin', pageViews: '100' },
      { timestamp: new Date(2020, 1, 1), userType: 'member', pageViews: '51' },
      { timestamp: new Date(2020, 1, 2), userType: 'admin', pageViews: '99' },
      { timestamp: new Date(2020, 1, 2), userType: 'public', pageViews: '21' }
    ]

    const result = transposeAndAggregateByDimensions({ data, metric: 'pageViews', dimensions: ['userType', 'day'], timeDimension: 'day' })
    expect(result).to.deep.equal([
      { timestamp: new Date(2020, 1, 1), admin: 100, member: 51, public: 0 },
      { timestamp: new Date(2020, 1, 2), admin: 99, member: 0, public: 21 }
    ])
  })

  it('should transpose and aggregate with non-time-dimension as aggregation key', () => {
    const data = [
      { a_hostname: 'hub.com', userType: 'admin', pageViews: '100' },
      { a_hostname: 'hub.com', userType: 'member', pageViews: '51' },
      { a_hostname: 'koop.com', userType: 'admin', pageViews: '99' },
      { a_hostname: 'koop.com', userType: 'public', pageViews: '21' }
    ]

    const result = transposeAndAggregateByDimensions({ data, metric: 'pageViews', dimensions: ['userType', 'a_hostname'] })
    expect(result).to.deep.equal([
      { a_hostname: 'hub.com', admin: 100, member: 51, public: 0 },
      { a_hostname: 'koop.com', admin: 99, member: 0, public: 21 }
    ])
  })

  it('should transpose and aggregate and handle empty strings', () => {
    const data = [
      { a_hostname: 'hub.com', userType: '', pageViews: '100' },
      { a_hostname: 'hub.com', userType: 'member', pageViews: '51' },
      { a_hostname: 'koop.com', userType: 'admin', pageViews: '99' },
      { a_hostname: 'koop.com', userType: 'public', pageViews: '21' }
    ]

    const result = transposeAndAggregateByDimensions({ data, metric: 'pageViews', dimensions: ['userType', 'a_hostname'] })
    expect(result).to.deep.equal([
      { a_hostname: 'hub.com', admin: 0, emptyString: 100, member: 51, public: 0 },
      { a_hostname: 'koop.com', admin: 99, emptyString: 0, member: 0, public: 21 }
    ])
  })
})
