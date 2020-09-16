const chai = require('chai')
const expect = chai.expect
const { routeParamsSchema } = require('../../lib/schema')

describe('schema', function () {
  describe('routeParamsSchema', function () {
    it('should reject invalid metric param', () => {
      const { error } = routeParamsSchema.validate({ id: 'unsupported' })
      expect(error).to.have.property('message', '"metric" must be one of [pageViews, sessions, sessionDuration]')
    })

    it('should allow metric params', () => {
      ['pageViews', 'sessions', 'sessionDuration'].forEach(metric => {
        const { error, value } = routeParamsSchema.validate({ id: metric })
        expect(error).to.be.an('undefined')
        expect(value).to.deep.equal({
          dimension: null,
          metric
        })
      })
    })

    it('should reject invalid dimension param', () => {
      const { error } = routeParamsSchema.validate({ id: 'pageViews:unsupported' })
      expect(error).to.have.property('message', '"dimension" must be [day]')
    })

    it('should allow valid dimension param', () => {
      const { error, value } = routeParamsSchema.validate({ id: 'pageViews:day' })
      expect(error).to.be.an('undefined')
      expect(value).to.deep.equal({
        dimension: 'day',
        metric: 'pageViews'
      })
    })
  })
})