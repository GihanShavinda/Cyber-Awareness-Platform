const { Queue } = require('bullmq');
const { connection } = require('../config/redis');

// A queue for scheduled phishing campaign jobs
const campaignQueue = new Queue('campaigns', { connection });

module.exports = { campaignQueue };