/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const createCompleteTimeseries = require('../../../lib/db/create-complete-timeseries')
const data = [
  {
    pageViews: 80,
    timestamp: new Date('2020-08-02T07:00:00.000Z')
  }
]
describe('createCompleteTimeseries', () => {
  it('should fill a timeseries that has missing timesteps', () => {
    const result = createCompleteTimeseries({
      data,
      metric: 'pageViews',
      startDate: '2020-08-01T07:00:00.000Z',
      endDate: '2020-08-03T07:00:00.000Z',
      interval: 'day'
    })
    expect(result).to.deep.equal([
      {
        pageViews: 0,
        timestamp: new Date('2020-08-01T07:00:00.000Z')
      },
      {
        pageViews: 80,
        timestamp: new Date('2020-08-02T07:00:00.000Z')
      },
      {
        pageViews: 0,
        timestamp: new Date('2020-08-03T07:00:00.000Z')
      }
    ])
  })
})
