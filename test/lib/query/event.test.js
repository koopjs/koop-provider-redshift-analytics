/* eslint-env mocha */
const chai = require('chai')
const proxyquire = require('proxyquire')
const sinon = require('sinon')
const expect = chai.expect
const modulePath = '../../../lib/query/event'
const configStub = {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema: 'redshift-schema',
      table: 'analytics-table',
      eventColumn: 'event-column',
      eventTimestampColumn: 'timestamp-column'
    },
    timeDimensions: ['day'],
    eventLookup: {
      pageViews: 'pageView'
    }
  }
}

describe('event query builder', () => {
  it('should build a non-dimensioned event count query', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildEventQuery({ metric: 'pageViews', time: { startDate: 'START', endDate: 'END' } })
    expect(query.toString()).to.equal('select count("event-column") as "page_views" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and raw-where-clause')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ endDate: 'END', startDate: 'START', where: undefined }])
  })

  it('should build a timestamp-dimensioned event count query', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildEventQuery({ metric: 'pageViews', dimension: 'day', time: { startDate: 'START', endDate: 'END' } })
    expect(query.toString()).to.equal('select DATE_TRUNC(\'day\', event_timestamp ) AS timestamp, count("event-column") as "page_views" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and raw-where-clause group by DATE_TRUNC(\'day\', event_timestamp ) order by DATE_TRUNC(\'day\', event_timestamp )')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ endDate: 'END', startDate: 'START', where: undefined }])
  })

  it('should build a non-timestamp-dimensioned event count query', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildEventQuery({ metric: 'pageViews', dimension: 'a_label', time: { startDate: 'START', endDate: 'END' } })
    expect(query.toString()).to.equal('select "a_label", count("event-column") as "page_views" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and raw-where-clause group by "a_label"')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ endDate: 'END', startDate: 'START', where: undefined }])
  })

  it('should build a non-dimensioned event count query with additional where fragment', () => {
    const rawWhereStub = sinon.stub().returns('raw-where-clause')
    const buildEventQuery = proxyquire(modulePath, {
      config: configStub,
      './helpers/raw-where': rawWhereStub
    })
    const query = buildEventQuery({ metric: 'pageViews', time: { startDate: 'START', endDate: 'END' }, where: 'x=\'y\'' })
    expect(query.toString()).to.equal('select count("event-column") as "page_views" from "redshift-schema"."analytics-table" where "event-column" = \'pageView\' and raw-where-clause')
    expect(rawWhereStub.calledOnce).to.equal(true)
    expect(rawWhereStub.firstCall.args).to.deep.equal([{ endDate: 'END', startDate: 'START', where: 'x=\'y\'' }])
  })
})
