const joi = require('joi')
const sqlstring = require('sqlstring')
const where = {
  type: 'where',
  base: joi.string(),
  coerce: {
    from: 'string',
    method (value, helpers) {
      if (!value) return

      return {
        value: sqlstring.escape(value)
      }
    }
  }
}

module.exports = where
