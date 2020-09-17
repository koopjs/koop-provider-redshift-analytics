/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire').noCallThru()
const buildRawWhere = proxyquire('../../../../lib/queries/helpers/raw-where', {
  config: {
    koopProviderRedshiftAnalytics: {
      redshift: {
        eventTimestampColumn: 'timestamp-column'
      }
    }
  }
})

describe('buildRawWhere', () => {
  it('should build where clause with default time range', () => {
    const result = buildRawWhere({})
    expect(result).to.equal('timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\'')
  })

  it('should build where clause with all options', () => {
    const result = buildRawWhere({ startDate: 'START_DATE', endDate: 'END_DATE', where: '1 = 2' })
    expect(result).to.equal('timestamp-column >= END_DATE - START_DATE AND 1 = 2')
  })
})
