const _ = require('lodash')
const {
  koopProviderRedshiftAnalytics: {
    redshift: {
      schema,
      table,
      eventColumn,
      eventTimestampColumn
    } = {},
    timeDimensions: TIME_DIMENSIONS,
    eventLookup
  }
} = require('config')
const db = require('../db')
const buildRawWhere = require('./helpers/raw-where')

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

  const rawWhere = buildRawWhere({ startDate, endDate, where })

  if (isDimensionTime(dimension)) {
    return buildTimeDimensionedEventCountQuery({ metric, dimension, rawWhere, startDate, endDate })
  }

  if (dimension) {
    return buildDimensionedEventCountQuery({ metric, dimension, rawWhere })
  }

  const query = buildEventCountQuery({ metric, rawWhere })
  console.log(query.toString())
  return buildEventCountQuery({ metric, rawWhere })
}

function buildTimeDimensionedEventCountQuery ({ metric, dimension, rawWhere, startDate, endDate }) {
  const metricAlias = getMetricAlias(metric)
  return db.select(db.raw(`DATE_TRUNC('${dimension}', ${eventTimestampColumn} ) AS timestamp`))
    .count(`${eventColumn} AS ${metricAlias}`)
    .withSchema(schema)
    .from(table)
    .where(eventColumn, '=', eventLookup[metric])
    .andWhereRaw(rawWhere)
    .groupByRaw(`DATE_TRUNC('${dimension}', ${eventTimestampColumn} )`)
    .orderByRaw(`DATE_TRUNC('${dimension}', ${eventTimestampColumn} )`)
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
