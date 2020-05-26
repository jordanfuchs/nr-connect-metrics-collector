const client = require('https');

const config = require('./config');

const sendToInsights = (body) => {
    const postData = typeof body === "string" ? body : JSON.stringify(body);
    const opts = { 
        hostname: "insights-collector.newrelic.com",
        port: 443, 
        path: `/v1/accounts/${config.accountId}/events`,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
            "X-Insert-Key": process.env.NEWRELIC_INSIGHTS_INSERT_KEY
        }
    }

    return new Promise((resolve,reject) => {
        const req = client.request(opts, (res) => {
            let chunks = [];
            res.on('data', (d) => chunks.push(d))
            res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks))));
        })
        req.on('error', reject);
        req.write(postData);
        req.end();
    })
}

module.exports = {sendToInsights};