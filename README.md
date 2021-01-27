# Koop Redshift Analytics Provider

A provider for querying and aggregating a telemetry data stored in Amazon Redshift.

## Environment Variables
The following environment variable must be set in order to connect to your Redshift instance:
```bash
KOOP_REDSHIFT_HOST
KOOP_REDSHIFT_PORT
KOOP_REDSHIFT_USER
KOOP_REDSHIFT_PASSWORD
KOOP_REDSHIFT_DATABASE
KOOP_REDSHIFT_SCHEMA
KOOP_REDSHIFT_TABLE
KOOP_REDSHIFT_COLUMN_EVENT
KOOP_REDSHIFT_COLUMN_SESSION
KOOP_REDSHIFT_TIMESTAMP_COLUMN
```

You can set different table/view sources for event and session queries by setting these additional environment variables:
```bash
KOOP_REDSHIFT_SCHEMA_EVENT
KOOP_REDSHIFT_TABLE_EVENT
KOOP_REDSHIFT_COLUMN_EVENT_TIMESTAMP

KOOP_REDSHIFT_SCHEMA_SESSION
KOOP_REDSHIFT_TABLE_SESSION
KOOP_REDSHIFT_COLUMN_SESSION_TIMESTAMP
```

## Configuration settings
The provider requires some configuration settings.  The code block below shows an example of these settings.

```json
{
  "koopProviderRedshiftAnalytics": {
    "dimensions": ["day"],
    "metrics": ["pageViews", "sessions", "avgSessionDuration"],
    "defaultTimeRangeStart": {
      "interval": "day",
      "count": 30
    },
    "eventLookup": {
      "pageViews": "page_view"
    }
  }
}
```

| Key   | Type | Description | Example |
|-|-|-|-|
| dimensions | string[] | An array of attributes that you will allow your analytics to be dimensioned by. These can include database time intervals (day, month, year, etc that get represented as `timestamp`) as well as any columns in your database table. | `["day", "month", "hostname", "org"]` |
| metrics | string[] | An array of metric types that your data supports. | `["pageViews", "sessions"]` |
| defaultTimeRangeStart |  object | A wrapper for settings related to defining a default start date for the time range of queries. The date will be a number of time intervals before the present. | |
| defaultTimeRangeStart.interval| string | A database time interval (e.g., day, month, year). | 30 |
| defaultTimeRangeStart.count| integer | The number of time intervals before the present to set the start of the time range. | 30 |
| eventLookup | object | Non-session metrics will likely be related to specific "event types" such as page-views, downloads, etc. The eventLookup translates the metric name (e.g., `pageViews`) to the actual event-type value (e.g. `page_view`)| |
| dimensionLookup | object | A map for application values for dimensions that are stored in columns with non-matched column names.  Example: telemetry data for `timeElapsed` is stored in column named `metric1`. Use this object to map queries for `userType` to column `dimension1`.| `{ "userType": "dimension1" }`|
| metricLookup | object | A map for application values for metrics that are stored in columns with non-matched column names.  Example: telemetry data for `timeElapsed` is stored in column named `metric1`. Use this object to map queries for `timeElapsed` to column `metric1`.| `{ "timeElapsed": "metric1" }`|

## Usage

### Path parameter
The provider is configured to have a single `:id` parameter. e.g.:

`/redshift-analytics/:id/FeatureServer/0/query`

The `:id` parameter can be delimited to hold values for the request's **metric**, **dimensions**, and **options**:

`<metric>:<dimensions>~<options>`

The table below explains the components of the `:id` parameter:

| `:id` component | delimiter | Description | Required? | Example |
|-|-|-|-|-|
| metric | N/A | The requested metric. | Yes | `pageView` |
| dimensions | `:` | Values of the requested dimensions. Request multiple dimensions by delimiting with a `,`. | No | `pageView:org,day` |
| options | `~` | Any provider specific options not representable with Geoservices API query parameters. Multiple options can submitted by delimiting with a `,`. | No | `pageView:org,day~transposeAndAggregate,otherOption` |

So if you want to request the `pageView` metric, dimensioned by `org` and by `day`, with the `transposeAndAggregate` option, your request would look like:

`/redshift-analytics/pageView:org,day~transposeAndAggregate/FeatureServer/0/query`

### Query Parameters

#### `time`
The `time` parameter adheres to the Geoservices API specification. It expects a comma delimited string that represent start and end times. `null` for either value will result in defaults.  Non-null values can be in the following formats: Unix epoch time, YYYY-MM-DD, or an ISO8601 date string.  If the request uses epoch time or YYYY-MM-DD, they should be in UTC.

#### `where`
The `where` parameter also adheres to the Geoservices API specification.  It allows users to limit the result set to those that have specific dimension values. For example, `where=hostname='koop.com'` would remove all records that do not have a `hostname` dimension with value `koop.com`.