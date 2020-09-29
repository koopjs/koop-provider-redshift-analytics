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
const buildRawWhere = require('./helpers/raw-where')
const {
  schema,
  table,
  sessionColumn,
  timestampColumn
} = sessionSource || defaultSource

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildSessionQuery (params = {}) {
  const {
    dimension,
    time: {
      startDate,
      endDate
    },
    where
  } = params

  const rawWhere = buildRawWhere({ startDate, endDate, where, timestampColumn })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedSessionCountQuery({ dimension, rawWhere })
  }

  if (dimension) {
    return buildDimensionedSessionCountQuery({ dimension, rawWhere })
  }

  return buildSessionCountQuery({ rawWhere })
}

function buildTimeDimensionedSessionCountQuery ({ dimension, rawWhere, startDate, endDate }) {
  return db.select(db.raw(`DATE_TRUNC('${dimension}', ${timestampColumn} ) AS timestamp, COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(rawWhere)
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

function buildDimensionedSessionCountQuery ({ dimension, rawWhere }) {
  return db.select(dimension, db.raw(`COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(rawWhere)
    .groupBy(dimension)
}

function buildSessionCountQuery ({ rawWhere }) {
  return db
    .select(db.raw(`COUNT(DISTINCT ${sessionColumn}) AS sessions`))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(rawWhere)
}

module.exports = buildSessionQuery
