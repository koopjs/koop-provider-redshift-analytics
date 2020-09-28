/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const expect = chai.expect
const modulePath = '../../../lib/query/session-duration'
const configStub = {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema: 'redshift-schema',
      table: 'analytics-table',
      sessionColumn: 'session-column',
      eventTimestampColumn: 'timestamp-column'
    },
    timeDimensions: ['day']
  }
}

describe('session-duration query builder', () => {
  it('should build a non-dimensioned session duration query', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildSessionDurationQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildSessionDurationQuery({ time: { startDate: 'START', endDate: 'END' } })
    expect(query.toString()).to.equal('select avg("session_duration") as "avgSessionDuration" from (select "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "session-column")')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ startDate: 'START', endDate: 'END', where: undefined }])
  })

  it('should build a timestamp-dimensioned session duration query', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildSessionDurationQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildSessionDurationQuery({ dimension: 'day', time: { startDate: 'START', endDate: 'END' } })
    expect(query.toString()).to.equal('select avg("session_duration") as "avgSessionDuration", DATE_TRUNC(\'day\', session_end ) AS timestamp from (select "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "session-column") group by DATE_TRUNC(\'day\', session_end)')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ startDate: 'START', endDate: 'END', where: undefined }])
  })

  it('should build a non-timestamp-dimensioned session duration query', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildSessionDurationQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildSessionDurationQuery({ dimension: 'a_hostname', time: { startDate: 'START', endDate: 'END' } })
    expect(query.toString()).to.equal('select avg("session_duration") as "avgSessionDuration", "a_hostname" from (select "a_hostname", "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "a_hostname", "session-column") group by "a_hostname"')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ startDate: 'START', endDate: 'END', where: undefined }])
  })

  it('should build a non-dimensioned session count query with addition where fragment', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildSessionDurationQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildSessionDurationQuery({ time: { startDate: 'START', endDate: 'END' }, where: 'x=\'y\'' })
    expect(query.toString()).to.equal('select avg("session_duration") as "avgSessionDuration" from (select "session-column", (CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(timestamp-column), MAX(timestamp-column)) AS FLOAT) END) AS session_duration, max("timestamp-column") as "session_end" from "redshift-schema"."analytics-table" where raw-where-clause group by "session-column")')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ startDate: 'START', endDate: 'END', where: 'x=\'y\'' }])
  })
})
