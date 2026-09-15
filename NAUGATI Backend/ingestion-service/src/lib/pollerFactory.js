const axios = require('axios');
const { publishEvent } = require('./queue');
const { recordHealth } = require('./dataSourceHealth');

// ARCHITECTURE.md §4: "live pollers need retry/backoff and feed DataSourceHealth"
// This factory centralizes that behavior so each provider file only needs to
// supply fetch + transform + which event to publish.
function createPoller({ source, fetchFn, transformFn, eventName, maxRetries = 3 }) {
  return async function poll() {
    let attempt = 0;
    let lastError;

    while (attempt < maxRetries) {
      try {
        const raw = await fetchFn();
        const payload = transformFn ? transformFn(raw) : raw;
        await publishEvent(eventName, payload);
        await recordHealth(source, 'api', 'ok');
        return payload;
      } catch (err) {
        lastError = err;
        attempt += 1;
        const backoffMs = 500 * 2 ** attempt; // exponential backoff
        await new Promise((r) => setTimeout(r, backoffMs));
      }
    }

    await recordHealth(source, 'api', 'failed', lastError?.message);
    // eslint-disable-next-line no-console
    console.error(`[${source}] poll failed after ${maxRetries} attempts:`, lastError?.message);
    return null;
  };
}

module.exports = { createPoller, axios };
