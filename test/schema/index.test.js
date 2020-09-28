/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const { paramsSchema } = require('../../lib/schema')

describe('schema', function () {
  it('should reject invalid metric param', () => {
    const { error } = paramsSchema.validate({ id: 'unsupported' })
    expect(error).to.have.property('message', '"metric" must be one of [pageViews, sessions, avgSessionDuration]')
  })

  it('should allow metric params', () => {
    ['pageViews', 'sessions', 'avgSessionDuration'].forEach(metric => {
      const { error, value } = paramsSchema.validate({ id: metric })
      expect(error).to.be.an('undefined')
      expect(value).to.have.property('dimension', null)
      expect(value).to.have.property('metric', metric)
    })
  })

  it('should reject invalid dimension param', () => {
    const { error } = paramsSchema.validate({ id: 'pageViews:unsupported' })
    expect(error).to.have.property('message', '"dimension" must be [day]')
  })

  it('should allow valid dimension param', () => {
    const { error, value } = paramsSchema.validate({ id: 'pageViews:day' })
    expect(error).to.be.an('undefined')
    expect(value).to.have.property('dimension', 'day')
    expect(value).to.have.property('metric', 'pageViews')
  })
})
