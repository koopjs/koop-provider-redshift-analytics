const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        defaultSource = {},
        session: sessionSource
      } = {}
    } = {}
  } = {}
} = require('config')
const db = require('../db')

function buildSessionDurationQuery (params = {}) {
  const {
    dimensions = [],
    timeDimension
  } = params

  if (timeDimension) {
    return buildTimeDimensionedQuery(params)
  }

  if (dimensions.length) {
    return buildDimensionedQuery(params)
  }

  return buildUndimensionedQuery(params)
}

function buildTimeDimensionedQuery (params) {
  return sessionSource ? buildTimeDimensionedQueryFromSessionSource(params) : buildTimeDimensionedQueryFromDefaultSource(params)
}

function buildTimeDimensionedQueryFromSessionSource (params) {
  const { sessionDurationColumn, timestampColumn, schema, table } = sessionSource
  const {
    dimensions,
    timeDimension,
    nonTimeDimensions,
    where,
    startDate,
    endDate,
    transposeAndAggregate
  } = params
  const rawSelect = [`DATE_TRUNC('${timeDimension}', ${timestampColumn}) AS timestamp`].concat(nonTimeDimensions).join(', ')
  const rawGroupBy = [`DATE_TRUNC('${timeDimension}', ${timestampColumn})`].concat(nonTimeDimensions).join(', ')
  return db.avg(`${sessionDurationColumn} as avg_session_duration`)
    .select(db.raw(rawSelect))
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
    .groupByRaw(rawGroupBy)
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

function buildTimeDimensionedQueryFromDefaultSource (params) {
  const {
    schema,
    table,
    sessionColumn,
    timestampColumn
  } = defaultSource

  const {
    dimensions,
    timeDimension,
    nonTimeDimensions,
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

function buildDimensionedQuery (params) {
  return sessionSource ? buildDimensionedQueryFromSessionSource(params) : buildDimensionedQueryFromDefaultSource(params)
}

function buildDimensionedQueryFromSessionSource ({ dimensions, where, transposeAndAggregate }) {
  const { sessionDurationColumn, schema, table } = sessionSource

  return db.avg(`${sessionDurationColumn} as avg_session_duration`)
    .select(...dimensions)
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
    .groupBy(...dimensions)
    .queryContext({
      snakeCases: ['avg_session_duration'],
      metric: 'avgSessionDuration',
      dimensions,
      transposeAndAggregate
    })
}

function buildDimensionedQueryFromDefaultSource ({ dimensions, where, transposeAndAggregate }) {
  const {
    schema,
    table,
    sessionColumn,
    timestampColumn
  } = defaultSource

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

function buildUndimensionedQuery ({ where }) {
  return sessionSource ? buildUndimensionedQueryFromSessionSource(where) : buildUndimensionedQueryFromDefaultSource(where)
}

function buildUndimensionedQueryFromSessionSource (where) {
  const { sessionDurationColumn, schema, table } = sessionSource
  return db.avg(`${sessionDurationColumn} as avg_session_duration`)
    .withSchema(schema)
    .from(table)
    .andWhereRaw(where)
    .queryContext({
      snakeCases: ['avg_session_duration']
    })
}

function buildUndimensionedQueryFromDefaultSource (where) {
  const {
    schema,
    table,
    sessionColumn,
    timestampColumn
  } = defaultSource

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
