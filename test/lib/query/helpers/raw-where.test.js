/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const buildRawWhere = require('../../../../lib/query/helpers/raw-where')

describe('buildRawWhere', () => {
  it('should build where clause with all options', () => {
    const result = buildRawWhere({ startDate: 'START_DATE', endDate: 'END_DATE', where: '1 = 2', timestampColumn: 'timestamp-column' })
    expect(result).to.equal('timestamp-column > \'START_DATE\' AND timestamp-column <= \'END_DATE\' AND 1 = 2')
  })
})
