import assert from "node:assert";
import "dotenv/config";
import { fetchGeopoliticalSignals } from "../integrations/geopolitical/gdelt.service.js";
import { withProviderHealth } from "../health/withProviderHealth.js";
import {
  getProviderHealth,
  resetProviderHealth
} from "../health/providerHealthRegistry.js";

async function runTests() {
  // TEST A: INVALID CALLER INPUT (must not affect provider health)
  resetProviderHealth("gdelt");

  await assert.rejects(
    async () => {
      await fetchGeopoliticalSignals({
        query: "",
        timespan: "24h",
        maxRecords: 10
      });
    },
    (err) => {
      assert.ok(err.message.includes("Invalid input"));
      return true;
    }
  );

  const uncalledHealth = getProviderHealth("gdelt");
  assert.strictEqual(uncalledHealth.status, "UNKNOWN");
  assert.strictEqual(uncalledHealth.last_attempt_at, null);
  assert.strictEqual(uncalledHealth.consecutive_failures, 0);

  // TEST B: LOCAL RATE-LIMIT HEALTH CLASSIFICATION (no external call)
  resetProviderHealth("gdelt");

  const mockRateLimitError = new Error(
    "GDELT rate limit reached. Wait before making another request."
  );
  mockRateLimitError.retryAfter = "5";

  await assert.rejects(
    async () => {
      await withProviderHealth("gdelt", async () => {
        throw mockRateLimitError;
      });
    },
    (err) => {
      assert.ok(err.message.includes("rate limit reached"));
      return true;
    }
  );

  const localRateLimitedHealth = getProviderHealth("gdelt");
  assert.strictEqual(localRateLimitedHealth.status, "RATE_LIMITED");
  assert.ok(localRateLimitedHealth.last_attempt_at);
  assert.strictEqual(localRateLimitedHealth.last_success_at, null);
  assert.ok(localRateLimitedHealth.last_error.includes("rate limit"));
  assert.strictEqual(localRateLimitedHealth.retry_after, "5");
  assert.strictEqual(localRateLimitedHealth.consecutive_failures, 1);

  console.log("Naugati GDELT health integration passed.");
  console.log("Safe health summary (local mock):");
  console.log(
    JSON.stringify(
      {
        provider: localRateLimitedHealth.provider,
        status: localRateLimitedHealth.status,
        latency_ms: localRateLimitedHealth.latency_ms,
        last_success_at: localRateLimitedHealth.last_success_at,
        retry_after: localRateLimitedHealth.retry_after,
        consecutive_failures: localRateLimitedHealth.consecutive_failures
      },
      null,
      2
    )
  );

  // TEST C: OPTIONAL LIVE CHECK (guarded by RUN_GDELT_LIVE_TEST)
  if (process.env.RUN_GDELT_LIVE_TEST === "true") {
    resetProviderHealth("gdelt");
    try {
      await fetchGeopoliticalSignals({
        query: '("port closure" OR "shipping disruption" OR "maritime attack")',
        timespan: "24h",
        maxRecords: 10
      });
      const liveHealth = getProviderHealth("gdelt");
      assert.strictEqual(liveHealth.status, "UP");
    } catch (err) {
      const liveHealth = getProviderHealth("gdelt");
      if (err.message.toLowerCase().includes("rate limit")) {
        assert.strictEqual(liveHealth.status, "RATE_LIMITED");
      } else {
        throw err;
      }
    }
  } else {
    console.log(
      "GDELT live health test skipped. Set RUN_GDELT_LIVE_TEST=true to enable one live provider request."
    );
  }
}

runTests();
