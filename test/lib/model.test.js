/* eslint-env mocha */
const sinon = require('sinon')
const chai = require('chai')
const proxyquire = require('proxyquire').noCallThru()
const expect = chai.expect
const { promisify } = require('util')
const modulePath = '../../lib/model'

describe('Model', function () {
  it('should reject unsupported metric parameter', async () => {
    const Model = proxyquire(modulePath, {
      './schema': {
        paramsSchema: {
          validate: () => {
            return { error: new Error('unsupported metric') }
          }
        }
      }
    })
    const model = new Model()
    const getData = promisify(model.getData)
    try {
      const geojson = await getData({ params: { id: 'unsupported' } })
      expect(geojson).to.be.undefined()
    } catch (err) {
      expect(err.message).to.equal('unsupported metric')
    }
  })

  it('should get geojson from the getData() function', async () => {
    const buildEventQueryStub = sinon.stub().resolves([{ foo: 'bar' }])
    const Model = proxyquire(modulePath, {
      './query': buildEventQueryStub,
      './schema': {
        paramsSchema: {
          validate: () => {
            return { value: { foo: 'bar' } }
          }
        }
      }
    })
    const model = new Model()
    const getData = promisify(model.getData)
    const geojson = await getData({ params: { id: 'views' }, query: {} })
    expect(geojson).to.deep.equal({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
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
