const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        defaultSource = {},
        session: sessionSource
      } = {}
    } = {},
    timeDimensions: TIME_DIMENSIONS
  }
} = require('config')
const db = require('../db')
const {
  schema,
  table,
  sessionColumn,
  timestampColumn
} = sessionSource || defaultSource

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildSessionQuery (params = {}) {
  const { dimension } = params

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedSessionCountQuery(params)
  }

  if (dimension) {
    return buildDimensionedSessionCountQuery(params)
  }

  return buildSessionCountQuery(params)
}

function buildTimeDimensionedSessionCountQuery ({ dimension, where, startDate, endDate }) {
  return db.select(db.raw(`DATE_TRUNC('${dimension}', ${timestampColumn} ) AS timestamp, COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
    .groupByRaw(`DATE_TRUNC('${dimension}', ${timestampColumn} )`)
    .orderByRaw(`DATE_TRUNC('${dimension}', ${timestampColumn} )`)
    .queryContext({
      timeseries: true,
      startDate,
      endDate,
      interval: dimension,
      metric: 'sessions'
    })
}

function buildDimensionedSessionCountQuery ({ dimension, where }) {
  return db.select(dimension, db.raw(`COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
    .groupBy(dimension)
}

function buildSessionCountQuery ({ where }) {
  return db
    .select(db.raw(`COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
}

module.exports = buildSessionQuery
