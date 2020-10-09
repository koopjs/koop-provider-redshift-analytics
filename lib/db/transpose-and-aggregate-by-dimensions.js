const _ = require('lodash')

module.exports = function (params) {
  const { data, metric, dimensions, timeDimension } = params

  const { transpositionDimension, aggregationDimension } = parseDimensions(dimensions, timeDimension)

  const transposedData = transposeAndAggregate({ data, metric, transpositionDimension, aggregationDimension })

  const placeholders = createZeroValuePlaceholdersForTranpose(transposedData)

  return mergePlaceholders(transposedData, placeholders)
}

function parseDimensions (dimensions, timeDimension) {
  const [transpositionDimension, aggregationDimension] = dimensions.map(dimension => {
    if (dimension === timeDimension) {
      return 'timestamp'
    }
    return dimension
  })

  return { transpositionDimension, aggregationDimension }
}

function transposeAndAggregate (params) {
  const {
    data,
    metric,
    transpositionDimension,
    aggregationDimension
  } = params
  return _.chain(data)
    .reduce((store, record) => {
      const transposedRecord = transposeRecord({ record, metric, aggregationDimension, transpositionDimension })
      if (!transposedRecord) return store
      return updateStore({ store, aggregationDimension, record: transposedRecord })
    }, {})
    .values()
    .value()
}

function transposeRecord ({ record, metric, aggregationDimension, transpositionDimension }) {
  if (!record[transpositionDimension] && record[transpositionDimension] !== '') return

  const transposedKey = record[transpositionDimension] === '' ? 'emptyString' : record[transpositionDimension]

  return {
    [aggregationDimension]: record[aggregationDimension],
    [transposedKey]: Number(record[metric])
  }
}

function updateStore ({ store, aggregationDimension, record }) {
  const aggregationKey = record[aggregationDimension]
  const currentValue = _.get(store, [aggregationKey], {})
  _.set(store, [aggregationKey], { ...currentValue, ...record })
  return store
}

function createZeroValuePlaceholdersForTranpose (transposedData) {
  return _.chain(transposedData)
    .map((record) => {
      return _.keys(record)
    })
    .flatten()
    .filter(key => {
      return key !== 'timestamp' && key !== 'undefined'
    })
    .map(key => {
      return [key, 0]
    })
    .fromPairs()
    .value()
}

function mergePlaceholders (transposedData, placeholders) {
  return _.chain(transposedData)
    .map(record => {
      return { ...placeholders, ...record }
    })
    .value()
}
