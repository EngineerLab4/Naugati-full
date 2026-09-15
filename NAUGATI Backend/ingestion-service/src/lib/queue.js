const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://redis:6379';
const redis = new Redis(REDIS_URL);

// ARCHITECTURE.md §5 — live-poller writes publish data-updated events to
// Redis Streams; recommendation-service / prediction-service / alert-rules
// consume from there. Dataset loaders do NOT publish (§5: "no downstream
// event fan-out required").
async function publishEvent(streamName, payload) {
  await redis.xadd(streamName, '*', 'data', JSON.stringify(payload));
}

module.exports = { redis, publishEvent };
