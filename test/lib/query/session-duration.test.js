/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const modulePath = '../../../lib/query/session-duration'

describe('session-duration query builder target default source', () => {
  const configStub = {
    koopProviderRedshiftAnalytics: {
      redshift: {
        sources: {
          defaultSource: {
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

  const buildSessionDurationQuery = proxyquire(modulePath, {
    'config': configStub // eslint-disable-line
  })

  it('should build a non-dimensioned session duration query', () => {
    const query = buildSessionDurationQuery({ startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session_duration") as "avg_session_duration" from (select "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "session-column")')
  })

  it('should build a time-dimensioned session duration query', () => {
    const query = buildSessionDurationQuery({ timeDimension: 'day', dimensions: ['day'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session_duration") as "avg_session_duration", DATE_TRUNC(\'day\', session_end) AS timestamp from (select "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "session-column") group by DATE_TRUNC(\'day\', session_end)')
  })

  it('should build a non-time-dimensioned session duration query', () => {
    const query = buildSessionDurationQuery({ dimensions: ['a_hostname'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session_duration") as "avg_session_duration", "a_hostname" from (select "a_hostname", "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "a_hostname", "session-column") group by "a_hostname"')
  })
})

describe('session-duration query builder targeting session view', () => {
  const configStub = {
    koopProviderRedshiftAnalytics: {
      redshift: {
        sources: {
          session: {
            schema: 'redshift-schema',
            table: 'session-view',
            sessionDurationColumn: 'session-duration-column',
            timestampColumn: 'timestamp-column'
          }
        }
      },
      timeDimensions: ['day']
    }
  }

  const buildSessionDurationQuery = proxyquire(modulePath, {
    'config': configStub // eslint-disable-line
  })

  it('should build a non-dimensioned session duration query', () => {
    const query = buildSessionDurationQuery({ startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session-duration-column") as "avg_session_duration" from "redshift-schema"."session-view" where raw-where-clause')
  })

  it('should build a time-dimensioned session duration query', () => {
    const query = buildSessionDurationQuery({ timeDimension: 'day', dimensions: ['day'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session-duration-column") as "avg_session_duration", DATE_TRUNC(\'day\', timestamp-column) AS timestamp from "redshift-schema"."session-view" where raw-where-clause group by DATE_TRUNC(\'day\', timestamp-column)')
  })

  it('should build a non-time-dimensioned session duration query', () => {
    const query = buildSessionDurationQuery({ dimensions: ['a_hostname'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select avg("session-duration-column") as "avg_session_duration", "a_hostname" from "redshift-schema"."session-view" where raw-where-clause group by "a_hostname"')
  })
})
