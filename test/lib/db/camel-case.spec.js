/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const camelCase = require('../../../lib/db/camel-case')

describe('camelCase', () => {
  it('should convert targeted snake case keys to camel case', () => {
    const result = camelCase([
      {
        page_views: 1000,
        timestamp: 0
      }, {
        timestamp: 1
      }], ['page_views'])
    expect(result).to.deep.equal([{
      pageViews: 1000,
      timestamp: 0
    }, {
      timestamp: 1
    }])
  })
})
