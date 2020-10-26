/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const proxyquire = require('proxyquire').noCallThru()
const modulePath = '../../../../lib/query/helpers/raw-where'
const _ = require('lodash')

describe('buildRawWhere', () => {
  describe('using default source', () => {
    const configStub = {
      koopProviderRedshiftAnalytics: {
        redshift: {
          sources: {
            defaultSource: {
              timestampColumn: 'default-timestamp-column'
            }
          }
        }
      }
    }
    it('should build where clause for session metric with default source', () => {
      const buildRawWhere = proxyquire(modulePath, { config: configStub })
      const result = buildRawWhere({ metric: 'sessions', startDate: 'START_DATE', endDate: 'END_DATE', where: '1 = 2' })
      expect(result).to.equal('default-timestamp-column > \'START_DATE\' AND default-timestamp-column <= \'END_DATE\' AND 1 = 2')
    })

    it('should build where clause for event metric with default source', () => {
      const buildRawWhere = proxyquire(modulePath, { config: configStub })
      const result = buildRawWhere({ metric: 'event', startDate: 'START_DATE', endDate: 'END_DATE', where: '1 = 2' })
      expect(result).to.equal('default-timestamp-column > \'START_DATE\' AND default-timestamp-column <= \'END_DATE\' AND 1 = 2')
    })
  })

  it('should build where clause for session metric with session source', () => {
    const configStub = {
      koopProviderRedshiftAnalytics: {
        redshift: {
          sources: {
            defaultSource: {
              timestampColumn: 'default-timestamp-column'
            },
            session: {
              timestampColumn: 'session-timestamp-column'
            },
            event: {
              timestampColumn: 'event-timestamp-column'
            }
          }
        }
      }
    }
    const buildRawWhere = proxyquire(modulePath, { config: configStub })
    const result = buildRawWhere({ metric: 'sessions', startDate: 'START_DATE', endDate: 'END_DATE', where: '1 = 2' })
    expect(result).to.equal('session-timestamp-column > \'START_DATE\' AND session-timestamp-column <= \'END_DATE\' AND 1 = 2')
  })

  it('should build where clause for event metric with event source', () => {
    const configStub = {
      koopProviderRedshiftAnalytics: {
        redshift: {
          sources: {
            defaultSource: {
              timestampColumn: 'default-timestamp-column'
            },
            session: {
              timestampColumn: 'session-timestamp-column'
            },
            event: {
              timestampColumn: 'event-timestamp-column'
            }
          }
        }
      }
    }
    _.set(configStub, 'koopProviderRedshiftAnalytics.redshift.sources.event.timestamp', 'event-timestamp-column')
    const buildRawWhere = proxyquire(modulePath, { config: configStub })
    const result = buildRawWhere({ metric: 'event', startDate: 'START_DATE', endDate: 'END_DATE', where: '1 = 2' })
    expect(result).to.equal('event-timestamp-column > \'START_DATE\' AND event-timestamp-column <= \'END_DATE\' AND 1 = 2')
  })
})
