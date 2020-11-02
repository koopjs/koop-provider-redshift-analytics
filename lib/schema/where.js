const joi = require('joi')
const { Parser } = require('flora-sql-parser')
const parser = new Parser()
const where = {
  type: 'where',
  base: joi.string(),
  validate: (value, helpers) => {
    if (!value) return

    try {
      const sql = `SELECT * FROM t WHERE ${value}`
      parser.parse(sql)
    } catch (error) {
      return { errors: [new Error('"where" parameter is invalid')] }
    }

    return {
      value
    }
  }

}

module.exports = where
