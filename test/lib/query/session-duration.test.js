/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const modulePath = '../../../lib/query/session-duration'
const configStub = {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        session: {
          schema: 'redshift-schema',
          table: 'analytics-table',
          sessionColumn: 'session-column',
          timestampColumn: 'timestamp-column'
        }
      }
    },
    timeDimensions: ['day']
  }
}

describe('session-duration query builder', () => {
  it('should build a non-dimensioned session duration query', () => {
    const buildSessionDurationQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildSessionDurationQuery({ time: { startDate: 'START', endDate: 'END' }, where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session_duration") as "avg_session_duration" from (select "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "session-column")')
  })

  it('should build a timestamp-dimensioned session duration query', () => {
    const buildSessionDurationQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildSessionDurationQuery({ dimension: 'day', time: { startDate: 'START', endDate: 'END' }, where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session_duration") as "avg_session_duration", DATE_TRUNC(\'day\', session_end ) AS timestamp from (select "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "session-column") group by DATE_TRUNC(\'day\', session_end)')
  })

  it('should build a non-timestamp-dimensioned session duration query', () => {
    const buildSessionDurationQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildSessionDurationQuery({ dimension: 'a_hostname', time: { startDate: 'START', endDate: 'END' }, where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session_duration") as "avg_session_duration", "a_hostname" from (select "a_hostname", "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "a_hostname", "session-column") group by "a_hostname"')
  })
})
