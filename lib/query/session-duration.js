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

function buildSessionDurationQuery (params = {}) {
  const {
    dimensions = [],
    timeDimension
  } = params

  if (timeDimension) {
    return buildTimeDimensionedSessionDurationQuery(params)
  }

  if (dimensions.length) {
    return buildDimensionedSessionDurationQuery(params)
  }

  return buildUndimensionedSessionDurationQuery(params)
}

function buildTimeDimensionedSessionDurationQuery (params) {
  const {
    dimensions,
    timeDimension,
    nonTimeDimensions = [],
    where,
    startDate,
    endDate,
    transposeAndAggregate
  } = params
  const rawSelect = [`DATE_TRUNC('${timeDimension}', session_end) AS timestamp`].concat(nonTimeDimensions).join(', ')
  const rawGroupBy = [`DATE_TRUNC('${timeDimension}', session_end)`].concat(nonTimeDimensions).join(', ')
  return db.avg('session_duration as avg_session_duration')
    .select(db.raw(rawSelect))
    .from(function () {
      this.select(sessionColumn, ...nonTimeDimensions, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${timestampColumn}), MAX(${timestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${timestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(where)
        .groupBy(sessionColumn, ...nonTimeDimensions)
    })
    .groupByRaw(rawGroupBy)
    .as('ignored_alias')
    .queryContext({
      timeseries: {
        startDate,
        endDate,
        interval: timeDimension
      },
      metric: 'avgSessionDuration',
      snakeCases: ['avg_session_duration'],
      transposeAndAggregate,
      dimensions,
      timeDimension
    })
}

function buildDimensionedSessionDurationQuery ({ dimensions, where, transposeAndAggregate }) {
  return db.avg('session_duration as avg_session_duration')
    .select(...dimensions)
    .from(function () {
      this.select(...dimensions, sessionColumn, db.raw(`(CASE WHEN COUNT(*) > 1 THEN CAST(DATEDIFF(second, MIN(${timestampColumn}), MAX(${timestampColumn})) AS FLOAT) END) AS session_duration`))
        .max(`${timestampColumn} as session_end`)
        .withSchema(schema)
        .from(table)
        .andWhereRaw(where)
        .groupBy(...dimensions, sessionColumn)
    })
    .groupBy(...dimensions)
    .as('ignored_alias')
    .queryContext({
      snakeCases: ['avg_session_duration'],
      metric: 'avgSessionDuration',
      dimensions,
      transposeAndAggregate
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
