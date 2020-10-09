/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const modulePath = '../../../lib/query/session'
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

describe('session query builder', () => {
  it('should build a non-dimensioned session count query', () => {
    const buildSessionQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildSessionQuery({ time: { startDate: 'START', endDate: 'END' }, where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where raw-where-clause')
  })

  it('should build a timestamp-dimensioned session count query', () => {
    const buildSessionQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildSessionQuery({ dimension: 'day', time: { startDate: 'START', endDate: 'END' }, where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select DATE_TRUNC(\'day\', timestamp-column ) AS timestamp, COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where raw-where-clause group by DATE_TRUNC(\'day\', timestamp-column ) order by DATE_TRUNC(\'day\', timestamp-column )')
  })

  it('should build a non-timestamp-dimensioned session count query', () => {
    const buildSessionQuery = proxyquire(modulePath, {
      config: configStub
    })
    const query = buildSessionQuery({ dimension: 'a_label', time: { startDate: 'START', endDate: 'END' }, where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select "a_label", COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where raw-where-clause group by "a_label"')
  })
})
