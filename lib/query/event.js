const _ = require('lodash')
const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      sources: {
        defaultSource = {},
        event: eventSource
      } = {}
    } = {},
    timeDimensions: TIME_DIMENSIONS,
    eventLookup
  }
} = require('config')
const db = require('../db')
const buildRawWhere = require('./helpers/raw-where')
const {
  schema,
  table,
  eventColumn,
  timestampColumn
} = eventSource || defaultSource

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildEventQuery (params) {
  const {
    metric,
    dimension,
    time: {
      startDate,
      endDate
    },
    where
  } = params

  const rawWhere = buildRawWhere({ startDate, endDate, where, timestampColumn })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedEventCountQuery({ metric, dimension, rawWhere, startDate, endDate })
  }

  if (dimension) {
    return buildDimensionedEventCountQuery({ metric, dimension, rawWhere })
  }

  return buildEventCountQuery({ metric, rawWhere })
}

function buildTimeDimensionedEventCountQuery ({ metric, dimension, rawWhere, startDate, endDate }) {
  const metricAlias = getMetricAlias(metric)
  return db.select(db.raw(`DATE_TRUNC('${dimension}', ${timestampColumn} ) AS timestamp`))
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(rawWhere)
    .groupByRaw(`DATE_TRUNC('${dimension}', ${timestampColumn} )`)
    .orderByRaw(`DATE_TRUNC('${dimension}', ${timestampColumn} )`)
    .queryContext({
      timeseries: true,
      startDate,
      endDate,
      interval: dimension,
      metric,
      snakeCases: metric === metricAlias ? undefined : [metricAlias]
    })
}

function buildDimensionedEventCountQuery ({ metric, dimension, rawWhere }) {
  const metricAlias = getMetricAlias(metric)
  return db.select(dimension)
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(rawWhere)
    .groupBy(dimension)
    .queryContext({
      snakeCases: metric === metricAlias ? undefined : [metricAlias]
    })
}

function buildEventCountQuery ({ metric, rawWhere }) {
  const metricAlias = getMetricAlias(metric)
  return db
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(rawWhere)
    .queryContext({
      snakeCases: metric === metricAlias ? undefined : [metricAlias]
    })
}

function getMetricAlias (metric) {
  const isCamelCased = /^[a-z][A-Za-z]*$/.test(metric)
  if (!isCamelCased) return metric

  return _.snakeCase(metric)
}

module.exports = buildEventQuery
