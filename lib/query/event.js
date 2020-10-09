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
const {
  schema,
  table,
  eventColumn,
  timestampColumn
} = eventSource || defaultSource

const isDimensionTime = (dimension) => TIME_DIMENSIONS.includes(dimension)

function buildEventQuery (params) {
  const { dimension } = params

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedEventCountQuery(params)
  }

  if (dimension) {
    return buildDimensionedEventCountQuery(params)
  }

  return buildEventCountQuery(params)
}

function buildTimeDimensionedEventCountQuery ({ metric, dimension, where, startDate, endDate }) {
  const metricAlias = getMetricAlias(metric)
  return db.select(db.raw(`DATE_TRUNC('${dimension}', ${timestampColumn} ) AS timestamp`))
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(where)
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

function buildDimensionedEventCountQuery ({ metric, dimension, where }) {
  const metricAlias = getMetricAlias(metric)
  return db.select(dimension)
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(where)
    .groupBy(dimension)
    .queryContext({
      snakeCases: metric === metricAlias ? undefined : [metricAlias]
    })
}

function buildEventCountQuery ({ metric, where }) {
  const metricAlias = getMetricAlias(metric)
  return db
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(where)
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
