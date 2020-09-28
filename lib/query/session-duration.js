const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema,
      table,
      sessionColumn,
      eventTimestampColumn
    } = {},
    timeDimensions: TIME_DIMENSIONS
  }
} = require('config')
const db = require('../db')
const buildRawWhere = require('./helpers/raw-where')

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildSessionDurationQuery (params = {}) {
  const {
    dimension,
    time: {
      startDate,
      endDate
    },
    where
  } = params

  const rawWhere = buildRawWhere({ startDate, endDate, where })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedSessionDurationQuery({ dimension, startDate, endDate, rawWhere })
  }

  if (dimension) {
    return buildDimensionedSessionDurationQuery({ dimension, rawWhere })
  }

  return buildUndimensionedSessionDurationQuery({ rawWhere })
}

function buildTimeDimensionedSessionDurationQuery ({ dimension, startDate, endDate, rawWhere }) {
  return db.avg('session_duration as avg_session_duration')
    .select(db.raw(`DATE_TRUNC('${dimension}', session_end ) AS timestamp`))
    .from(function () {
      this.select(sessionColumn, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${eventTimestampColumn}), MAX(${eventTimestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${eventTimestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(rawWhere)
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

function buildDimensionedSessionDurationQuery ({ dimension, rawWhere }) {
  return db.avg('session_duration as avg_session_duration')
    .select(dimension)
    .from(function () {
      this.select(dimension, sessionColumn, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${eventTimestampColumn}), MAX(${eventTimestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${eventTimestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(rawWhere)
        .groupBy(dimension, sessionColumn)
    })
    .groupBy(dimension)
    .as('ignored_alias')
    .queryContext({
      snakeCases: ['avg_session_duration']
    })
}

function buildUndimensionedSessionDurationQuery ({ rawWhere }) {
  return db.avg('session_duration as avg_session_duration')
    .from(function () {
      this.select(sessionColumn, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${eventTimestampColumn}), MAX(${eventTimestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${eventTimestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(rawWhere)
        .groupBy(sessionColumn)
    })
    .queryContext({
      snakeCases: ['avg_session_duration']
    })
    .as('ignored_alias')
}

module.exports = buildSessionDurationQuery
