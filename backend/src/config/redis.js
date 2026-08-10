const IORedis = require('ioredis');

// Connection to the Redis container (from docker-compose).
// maxRetriesPerRequest: null is required by BullMQ.
const connection = new IORedis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,
});

connection.on('connect', () => console.log('✅ Redis connected'));
connection.on('error', (err) => console.error('Redis error:', err.message));

module.exports = { connection };