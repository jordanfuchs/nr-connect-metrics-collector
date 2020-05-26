module.exports = {
    accountId: '', // NR account ID
    instanceIds: [], // Array of Instance ID's to track 
    ignoreQueues: [], // Array of queue's to ignore (Can be left blank!)
    queueTypes: ["STANDARD"] // Types of Queues to check... [STANDARD], [AGENT] or [] (both) 
}

if (!module.exports.accountId) {
    console.log("New Relic AccountID missing, please check config.js");
    process.exit();
}

if (!module.exports.instanceIds.length) {
    console.log("Instance ID's missing, please check config.js");
    process.exit();
}