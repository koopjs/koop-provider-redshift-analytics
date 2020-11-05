const joi = require('joi')
const { Parser, util: { astToSQL } } = require('flora-sql-parser')
const {
  koopProviderRedshiftAnalytics: {
    metricLookup = {},
    dimensionLookup = {}
  } = {}
} = require('config')

const parser = new Parser()
const where = {
  type: 'where',
  base: joi.string(),
  coerce: {
    from: 'string',
    method (value) {
      if (!value) return

      const { errors, abstractSyntaxTree } = parse(value)
      if (errors) return { errors }

      const { where } = replaceColumnNames(abstractSyntaxTree)

      return {
        value: where
      }
    }
  }

}

function parse (value) {
  try {
    const sql = `SELECT * FROM t WHERE ${value}`
    const abstractSyntaxTree = parser.parse(sql)
    return { abstractSyntaxTree }
  } catch (error) {
    if (process.env.KOOP_LOG_LEVEL === 'debug') console.log(error)
    return { errors: [new Error('"where" parameter is invalid')] }
  }
}

function replaceColumnNames (abstractSyntaxTree) {
  const modifiedAst = {
    ...abstractSyntaxTree,
    where: mutateWhereAst(abstractSyntaxTree.where)
  }
  const sql = astToSQL(modifiedAst)
  const idRegex = /^SELECT \* FROM "t" WHERE (?<where>.+)$/
  const { groups: { where } } = idRegex.exec(sql)
  return { where }
}

function mutateWhereAst (node) {
  const { right, left, type, column } = node
  if (type === 'column_ref') {
    node.column = metricLookup[column] || dimensionLookup[column] || column
  }

  if (!left && !right) return

  if (left) mutateWhereAst(left)
  if (right) mutateWhereAst(right)
  return node
}

module.exports = where
