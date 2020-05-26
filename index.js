const AWS = require('aws-sdk');
const connect = new AWS.Connect();

const config = require('./config');
const request = require('./request');

const getMetricData = (instance) => {
    return connect.getCurrentMetricData({
        InstanceId: instance.InstanceId,
        CurrentMetrics: [
            { Name: "AGENTS_AFTER_CONTACT_WORK", Unit: "COUNT" },
            { Name: "AGENTS_AVAILABLE", Unit: "COUNT"},
            { Name: "AGENTS_ERROR", Unit: "COUNT"},
            { Name: "AGENTS_NON_PRODUCTIVE", Unit: "COUNT"},
            { Name: "AGENTS_ON_CALL", Unit: "COUNT"},
            { Name: "AGENTS_ON_CONTACT", Unit: "COUNT"},
            { Name: "AGENTS_ONLINE", Unit: "COUNT"},
            { Name: "AGENTS_STAFFED", Unit: "COUNT"},
            { Name: "CONTACTS_IN_QUEUE", Unit: "COUNT"},
            { Name: "CONTACTS_SCHEDULED", Unit: "COUNT"},
            { Name: "OLDEST_CONTACT_AGE", Unit: "SECONDS"},
            { Name: "SLOTS_ACTIVE", Unit: "COUNT"},
            { Name: "SLOTS_AVAILABLE", Unit: "COUNT"}
        ],
        Filters: { Channels: [ "VOICE" ], Queues: instance.Queues.map(({Id}) => Id) },
        Groupings: ['QUEUE'],
        MaxResults: 100
    }).promise()
    .then((results) => results.MetricResults.length ? results.MetricResults : null)
    // .then((results) => ((results || {}).MetricResults || []) || null)
    .then((results) => results && ({ ...instance, MetricResults: results || [] }))
    .catch(err => {
        console.log("Error:",err);
        return null;
    })
}

const getQueues = (InstanceId) => {
    return connect.listQueues({InstanceId, QueueTypes: config.queueTypes}).promise()
        .then((queues) => (queues || {}).QueueSummaryList || [])
        .then((queues) => queues.filter(({Id}) => !config.ignoreQueues.includes(Id)))
        .then((Queues) => ({ InstanceId, Queues }));
}

const formatMetricName = (name) => {
    return name
        .split('_')
        .map((part,i) => `${i ? part[0] : part[0].toLowerCase()}${part.slice(1).toLowerCase()}`)
        .join('');
}

const sendToNewRelicInsights = (instanceData) => {
    const payload = instanceData.MetricResults.map((metricResult) => {
        let event = {
            "eventType": "AwsConnectMetrics",
            "provider.instanceId": instanceData.InstanceId,
            "provider.queueId": metricResult.Dimensions.Queue.Id
        }

        metricResult.Collections.forEach(({Metric, Value}) => {
            event[`provider.${formatMetricName(Metric.Name)}`] = Value;
        });

        return event;
    });

    return request.sendToInsights(payload);
}

exports.handler = async () => {
    const instances = await Promise.all(config.instanceIds.map(getQueues))
        .then((instancesAndQueues) => Promise.all(instancesAndQueues.map(getMetricData)))
        .then((instances) => instances.filter((i) => i));

    return await Promise.all(instances.map(sendToNewRelicInsights));
}
