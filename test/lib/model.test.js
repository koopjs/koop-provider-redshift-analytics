/* eslint-env mocha */
const sinon = require('sinon')
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const { promisify } = require('util')
const modulePath = '../../lib/model'

describe('Model', function () {
  it('should reject unsupported metric parameter', async () => {
    const Model = require(modulePath)
    const model = new Model()
    const getData = promisify(model.getData)
    try {
      const geojson = await getData({ params: { id: 'unsupported' } })
      expect(geojson).to.be.undefined()
    } catch (err) {
      expect(err.message).to.equal('"metric" must be one of [pageViews, sessions, avgSessionDuration]')
    }
    
  })

  it('should get geojson from the getData() function', async () => {
    const buildEventQueryStub = sinon.stub().resolves([{ foo: 'bar' }])
    const Model = proxyquire(modulePath, {
      './queries': {
        buildEventQuery: buildEventQueryStub
      }
    })
    const model = new Model()
    const getData = promisify(model.getData)
    const geojson = await getData({ params: { id: 'pageViews' }, query: {} })
    expect(geojson).to.deep.equal({
      type: 'FeatureCollection',
      features: [
        {
          type: "Feature",
          geometry: null,
          properties: {
            foo: 'bar'
          }
        }
      ],
      filtersApplied: {
        where: true
      }
    })
    expect(geojson.features).to.be.an('array')
    sinon.restore()
  })
})
