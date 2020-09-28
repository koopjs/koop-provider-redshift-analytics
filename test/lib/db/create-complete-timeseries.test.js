/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const createCompleteTimeseries = require('../../../lib/db/create-complete-timeseries')
const data = [
  {
    metric: 80,
    timestamp: new Date('2020-08-02T07:00:00.000Z')
  }
]
describe('createCompleteTimeseries', () => {
  it('should fill a timeseries that has missing timesteps', () => {
    const result = createCompleteTimeseries({
      data,
      startDate: '2020-08-01T07:00:00.000Z',
      endDate: '2020-08-03T07:00:00.000Z',
      interval: 'day'
    })
    expect(result).to.deep.equal([
      {
        timestamp: new Date('2020-08-01T07:00:00.000Z')
      },
      {
        metric: 80,
        timestamp: new Date('2020-08-02T07:00:00.000Z')
      },
      {
        timestamp: new Date('2020-08-03T07:00:00.000Z')
      }
    ])
  })
})
