-- basic queries we need to support in MVP

-- pageView counts for a time range
SELECT COUNT(*)
  FROM pinpoint.hub
  WHERE a_hostname = 'hub.arcgis.com' 
  	AND event_type = 'pageView'
  	AND event_timestamp >= CURRENT_DATE - INTERVAL '30 DAY';

-- session counts over a range
SELECT
	COUNT(*) AS sessions
FROM (
	SELECT DISTINCT(session_id)
	FROM pinpoint.hub
	WHERE
		a_hostname = 'hub.arcgis.com'
		AND event_timestamp >= CURRENT_DATE - INTERVAL '30 DAY'
	);

-- Average session duration over a range
SELECT
	AVG(session_duration) AS avg_session_duration
FROM (
	SELECT
		session_id,
		max(event_timestamp) AS session_end,
    (CASE
			WHEN COUNT(*) > 1
      THEN CAST(DATEDIFF(second, MIN(event_timestamp), MAX(event_timestamp)) AS FLOAT)
    END) AS session_duration
	FROM pinpoint.hub
	WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 DAY'
	GROUP BY session_id
	)
WHERE session_duration > 0;

-- Time series of pageView counts over a range
SELECT
	DATE_TRUNC('DAY', event_timestamp ) AS timestamp
	COUNT(event_type) AS pageViews, 
  FROM pinpoint.hub
  WHERE 
		a_hostname = 'hub.arcgis.com' 
  	AND event_type = 'pageView'
  	AND event_timestamp >= CURRENT_DATE - INTERVAL '30 DAY'
  	GROUP BY  DATE_TRUNC('DAY', event_timestamp );

-- Time series of session counts over a range
SELECT
	DATE_TRUNC('DAY', session_end ) AS timestamp,
	COUNT(*) AS sessions
FROM (
	SELECT
		session_id,
		max(event_timestamp) AS session_end
	FROM pinpoint.hub
	WHERE
		a_hostname = 'hub.arcgis.com' 
		event_timestamp >= CURRENT_DATE - INTERVAL '30 DAY'
	GROUP BY session_id
	)
GROUP BY DATE_TRUNC('DAY', session_end ) ORDER BY DATE_TRUNC('DAY', session_end );

-- Time series of average session duration over a range
SELECT
	DATE_TRUNC('DAY', session_end ) AS timestamp,
	AVG(session_duration) AS avg_session_duration
FROM (
	SELECT
		session_id,
		max(event_timestamp) AS session_end,
    (CASE
			WHEN COUNT(*) > 1
      THEN CAST(DATEDIFF(second, MIN(event_timestamp), MAX(event_timestamp)) AS FLOAT)
    END) AS session_duration
	FROM pinpoint.hub
	WHERE event_timestamp >= CURRENT_DATE - INTERVAL '30 DAY'
	GROUP BY session_id
	)
WHERE session_duration > 0
GROUP BY DATE_TRUNC('DAY', session_end ) ORDER BY DATE_TRUNC('DAY', session_end );

-- Events (average per day) per month for a range
SELECT AVG(per_day), DATE_TRUNC('MONTH', event_day ) as event_month
FROM (
	SELECT COUNT(event_type) AS per_day, DATE_TRUNC('DAY', event_timestamp ) AS event_day
  	FROM pinpoint.hub
  	WHERE 
			a_hostname = 'hub.arcgis.com'
  		AND event_type = 'pageView'
  		AND event_timestamp >= CURRENT_DATE - INTERVAL '12 MONTH'
  		GROUP BY  event_day 
) GROUP BY event_month ORDER BY event_month; 
