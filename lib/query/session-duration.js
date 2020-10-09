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

function buildSessionDurationQuery (params = {}) {
  const {
    dimension
  } = params

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedSessionDurationQuery(params)
  }

  if (dimension) {
    return buildDimensionedSessionDurationQuery(params)
  }

  return buildUndimensionedSessionDurationQuery(params)
}

function buildTimeDimensionedSessionDurationQuery ({ dimension, startDate, endDate, where }) {
  return db.avg('session_duration as avg_session_duration')
    .select(db.raw(`DATE_TRUNC('${dimension}', session_end ) AS timestamp`))
    .from(function () {
      this.select(sessionColumn, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${timestampColumn}), MAX(${timestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${timestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(where)
        .groupBy(sessionColumn)
    })
    .groupByRaw(`DATE_TRUNC('${dimension}', session_end)`)
    .as('ignored_alias')
    .queryContext({
      timeseries: true,
      startDate,
      endDate,
      interval: dimension,
      metric: 'avgSessionDuration',
      snakeCases: ['avg_session_duration']
    })
}

function buildDimensionedSessionDurationQuery ({ dimension, where }) {
  return db.avg('session_duration as avg_session_duration')
    .select(dimension)
    .from(function () {
      this.select(dimension, sessionColumn, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${timestampColumn}), MAX(${timestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${timestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(where)
        .groupBy(dimension, sessionColumn)
    })
    .groupBy(dimension)
    .as('ignored_alias')
    .queryContext({
      snakeCases: ['avg_session_duration']
    })
}

function buildUndimensionedSessionDurationQuery ({ where }) {
  return db.avg('session_duration as avg_session_duration')
    .from(function () {
      this.select(sessionColumn, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${timestampColumn}), MAX(${timestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${timestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(where)
        .groupBy(sessionColumn)
    })
    .queryContext({
      snakeCases: ['avg_session_duration']
    })
    .as('ignored_alias')
}

module.exports = buildSessionDurationQuery
