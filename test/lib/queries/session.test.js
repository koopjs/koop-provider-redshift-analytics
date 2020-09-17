/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const modulePath = '../../../lib/queries/session'
const configStub = {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema: 'redshift-schema',
      table: 'analytics-table',
      sessionColumn: 'session-column',
      eventTimestampColumn: 'timestamp-column'
    },
    timeDimensions: ['day'],
    defaultStartDate: 'INTERVAL \'30 DAY\''
  }
}

describe('session query builder', () => {
  it('should build a non-dimensioned session count query', () => {
    const buildSessionQuery = proxyquire(modulePath, {
      'config': configStub
    })
    const query = buildSessionQuery()
    expect(query.toString()).to.equal('select COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\'')
  })

  it('should build a timestamp-dimensioned session count query', () => {
    const buildSessionQuery = proxyquire(modulePath, {
      'config': configStub
    })
    const query = buildSessionQuery({ dimension: 'day' })
    expect(query.toString()).to.equal('select DATE_TRUNC(\'day\', event_timestamp ) AS timestamp, COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\' group by DATE_TRUNC(\'day\', event_timestamp ) order by DATE_TRUNC(\'day\', event_timestamp )')
  })

  it('should build a non-timestamp-dimensioned session count query', () => {
    const buildSessionQuery = proxyquire(modulePath, {
      'config': configStub
    })
    const query = buildSessionQuery({ dimension: 'a_label' })
    expect(query.toString()).to.equal('select "a_label", COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\' group by "a_label"')
  })

  it('should build a non-dimensioned session count query with addition where fragment', () => {
    const buildSessionQuery = proxyquire(modulePath, {
      'config': configStub
    })
    const query = buildSessionQuery({ where: 'x=\'y\'' })
    expect(query.toString()).to.equal('select COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where timestamp-column >= CURRENT_DATE - INTERVAL \'30 DAY\' AND x=\'y\'')
  })
})
