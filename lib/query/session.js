const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        defaultSource = {},
        session: sessionSource
      } = {}
    } = {}
  }
} = require('config')
const db = require('../db')
const {
  schema,
  table,
  sessionColumn,
  timestampColumn
} = sessionSource || defaultSource

const selectSession = sessionSource ? 'COUNT(*) AS sessions' : `COUNT(DISTINCT ${sessionColumn}) AS sessions`

function buildSessionQuery (params = {}) {
  const {
    dimensions = [],
    timeDimension
  } = params

  if (timeDimension) {
    return buildTimeDimensionedSessionCountQuery(params)
  }

  if (dimensions.length) {
    return buildDimensionedSessionCountQuery(params)
  }

  return buildSessionCountQuery(params)
}

function buildTimeDimensionedSessionCountQuery (params) {
  const {
    dimensions,
    timeDimension,
    nonTimeDimensions = [],
    where,
    startDate,
    endDate,
    transposeAndAggregate
  } = params

  const rawSelect = [
    `DATE_TRUNC('${timeDimension}', ${timestampColumn} ) AS timestamp`,
    selectSession
  ].concat(nonTimeDimensions).join(', ')

  const rawGroupBy = [`DATE_TRUNC('${timeDimension}', ${timestampColumn} )`].concat(nonTimeDimensions).join(', ')

  return db.select(db.raw(rawSelect))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
    .groupByRaw(rawGroupBy)
    .orderByRaw(`DATE_TRUNC('${timeDimension}', ${timestampColumn} )`)
    .queryContext({
      timeseries: {
        startDate,
        endDate,
        interval: timeDimension
      },
      metric: 'sessions',
      dimensions,
      timeDimension,
      transposeAndAggregate
    })
}

function buildDimensionedSessionCountQuery ({ dimensions, where, transposeAndAggregate }) {
  return db.select(...dimensions, db.raw(selectSession))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
    .groupBy(...dimensions)
    .queryContext({
      metric: 'sessions',
      dimensions,
      transposeAndAggregate
    })
}

function buildSessionCountQuery ({ where }) {
  return db
    .select(db.raw(selectSession))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
}

module.exports = buildSessionQuery
