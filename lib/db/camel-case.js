const _ = require('lodash')

module.exports = function (data, snakeCases) {
  return data.map(record => {
    return snakeCases.reduce((record, key) => {
      if (record[key]) {
        record[_.camelCase(key)] = record[key]
        delete record[key]
      }
      return record
    }, record)
  })
}
