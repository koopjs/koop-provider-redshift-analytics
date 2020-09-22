/* eslint-env mocha */
const chai = require('chai')
const expect = chai.expect
const { paramsSchema } = require('../../lib/schema')
const iso8601Regex = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/

describe('schema', function () {
  describe('paramsSchema', function () {
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
        expect(value).to.have.property('time').to.be.an('object')
        expect(value.time).to.have.property('startDate').and.be.a('string')
        expect(iso8601Regex.test(value.time.startDate)).to.equal(true)
        expect(value.time).to.have.property('endDate').and.be.a('string')
        expect(iso8601Regex.test(value.time.endDate)).to.equal(true)
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
      expect(value).to.have.property('time').to.be.an('object')
      expect(value.time).to.have.property('startDate').and.be.a('string')
      expect(iso8601Regex.test(value.time.startDate)).to.equal(true)
      expect(value.time).to.have.property('endDate').and.be.a('string')
      expect(iso8601Regex.test(value.time.endDate)).to.equal(true)
    })
  })
})
