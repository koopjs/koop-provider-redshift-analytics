/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const modulePath = '../../../lib/query/event'
const configStub = {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        event: {
          schema: 'redshift-schema',
          table: 'analytics-table',
          eventColumn: 'event-column',
          timestampColumn: 'timestamp-column'
        }
      }
    },
    timeDimensions: ['day']
  }
}

describe('event query builder', () => {
  it('should build a non-dimensioned event count query', () => {
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildEventQuery({ metric: 'pageView', startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select count("event-column") as "page_view" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and raw-where-clause')
  })

  it('should build a timestamp-dimensioned event count query', () => {
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildEventQuery({ metric: 'pageView', timeDimension: 'day', nonTimeDimensions: [], dimensions: ['day'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select DATE_TRUNC(\'day\', timestamp-column ) AS timestamp, count("event-column") as "page_view" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and raw-where-clause group by DATE_TRUNC(\'day\', timestamp-column ) order by DATE_TRUNC(\'day\', timestamp-column )')
  })

  it('should build a non-timestamp-dimensioned event count query', () => {
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildEventQuery({ metric: 'pageView', dimensions: ['a_label'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select "a_label", count("event-column") as "page_view" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and raw-where-clause group by "a_label"')
  })
})
