/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const modulePath = '../../../lib/query/session'

describe('session query builder using default source', () => {
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
  const buildSessionQuery = proxyquire(modulePath, {
    'config': configStub // eslint-disable-line
  })

  it('should build a non-dimensioned session count query', () => {
    const query = buildSessionQuery({ startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where raw-where-clause')
  })

  it('should build a timestamp-dimensioned session count query', () => {
    const query = buildSessionQuery({ timeDimension: 'day', dimensions: ['day'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select DATE_TRUNC(\'day\', timestamp-column ) AS timestamp, COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where raw-where-clause group by DATE_TRUNC(\'day\', timestamp-column ) order by DATE_TRUNC(\'day\', timestamp-column )')
  })

  it('should build a non-timestamp-dimensioned session count query', () => {
    const query = buildSessionQuery({ dimensions: ['a_label'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select "a_label", COUNT(DISTINCT session-column) AS sessions from "redshift-schema"."analytics-table" where raw-where-clause group by "a_label"')
  })
})

describe('session query builder using session source', () => {
  const configStub = {
    koopProviderRedshiftAnalytics: {
      redshift: {
        sources: {
          session: {
            schema: 'redshift-schema',
            table: 'session-view',
            sessionColumn: 'session-column',
            timestampColumn: 'timestamp-column'
          }
        }
      },
      timeDimensions: ['day']
    }
  }
  const buildSessionQuery = proxyquire(modulePath, {
    'config': configStub // eslint-disable-line
  })

  it('should build a non-dimensioned session count query', () => {
    const query = buildSessionQuery({ startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select COUNT(*) AS sessions from "redshift-schema"."session-view" where raw-where-clause')
  })

  it('should build a timestamp-dimensioned session count query', () => {
    const query = buildSessionQuery({ timeDimension: 'day', dimensions: ['day'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select DATE_TRUNC(\'day\', timestamp-column ) AS timestamp, COUNT(*) AS sessions from "redshift-schema"."session-view" where raw-where-clause group by DATE_TRUNC(\'day\', timestamp-column ) order by DATE_TRUNC(\'day\', timestamp-column )')
  })

  it('should build a non-timestamp-dimensioned session count query', () => {
    const query = buildSessionQuery({ dimensions: ['a_label'], startDate: 'START', endDate: 'END', where: 'raw-where-clause' })
    expect(query.toString()).to.equal('select "a_label", COUNT(*) AS sessions from "redshift-schema"."session-view" where raw-where-clause group by "a_label"')
  })
})
