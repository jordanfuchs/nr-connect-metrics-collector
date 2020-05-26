# New Relic AWS Connect Metrics Collector

#### Installation Steps:

1. Install AWS Connect NR infra plugin
2. clone repo
3. update config.js (need NR account ID & instance/queue ID's)
4. `npm run build`
5. upload zip to lambda with appropriate permissions
6. add environment variable "NEWRELIC_INSIGHTS_INSERT_KEY"
7. create CW event to trigger lambda every 1, 5, 10, 15 mins etc

#### Things to note:
 - some stats update ~ every 15 seconds, most update every 1 min, some every 5
 - recommend CW rule to trigger every 5 mins, but can be more or less frequent depending on use case
 - Takes ~1.5 sec to run (for 1 instance), default 3 sec timeout should be plenty but may need to be increased if monitoring many instances


