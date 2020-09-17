/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const expect = chai.expect
const modulePath = '../../../lib/queries/event'
const configStub = {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema: 'redshift-schema',
      table: 'analytics-table',
      eventColumn: 'event-column',
      eventTimestampColumn: 'timestamp-column'
    },
    timeDimensions: ['day'],
    defaultStartDate: 'INTERVAL \'30 DAY\'',
    eventLookup: {
      pageViews: 'pageView'
    }
  }
}

describe('event query builder', () => {
  it('should build a non-dimensioned event count query', () => {
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildEventQuery({ metric: 'pageViews' })
    expect(query.toString()).to.equal('select count("event-column") as "pageViews" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\'')
  })

  it('should build a timestamp-dimensioned event count query', () => {
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildEventQuery({ metric: 'pageViews', dimension: 'day' })
    expect(query.toString()).to.equal('select DATE_TRUNC(\'day\', event_timestamp ) AS timestamp, count("event-column") as "pageViews" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\' group by DATE_TRUNC(\'day\', event_timestamp ) order by DATE_TRUNC(\'day\', event_timestamp )')
  })

  it('should build a non-timestamp-dimensioned event count query', () => {
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildEventQuery({ metric: 'pageViews', dimension: 'a_label' })
    expect(query.toString()).to.equal('select "a_label", count("event-column") as "pageViews" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\' group by "a_label"')
  })

  it('should build a non-dimensioned event count query with addition where fragment', () => {
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildEventQuery({ metric: 'pageViews', where: 'x=\'y\'' })
    expect(query.toString()).to.equal('select count("event-column") as "pageViews" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\' AND x=\'y\'')
  })
})
