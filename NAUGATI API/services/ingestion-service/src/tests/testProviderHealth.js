import assert from "node:assert";
import {
  PROVIDER_STATUS,
  createProviderHealthRecord,
  markProviderSuccess,
  markProviderFailure,
  markCredentialPending,
  markRateLimited,
  isProviderDataStale
} from "../health/providerHealth.js";

function runTests() {
  // 1. Create record for "open-meteo"
  const initialOpenMeteo = createProviderHealthRecord("open-meteo");
  assert.strictEqual(initialOpenMeteo.provider, "open-meteo");
  assert.strictEqual(initialOpenMeteo.status, PROVIDER_STATUS.UNKNOWN);
  assert.strictEqual(initialOpenMeteo.last_attempt_at, null);
  assert.strictEqual(initialOpenMeteo.last_success_at, null);
  assert.strictEqual(initialOpenMeteo.latency_ms, null);
  assert.strictEqual(initialOpenMeteo.last_error, null);
  assert.strictEqual(initialOpenMeteo.retry_after, null);
  assert.strictEqual(initialOpenMeteo.consecutive_failures, 0);

  // 2. Mark success with latency 125
  const successOpenMeteo = markProviderSuccess(initialOpenMeteo, 125);
  assert.strictEqual(successOpenMeteo.status, PROVIDER_STATUS.UP);
  assert.strictEqual(successOpenMeteo.latency_ms, 125);
  assert.ok(successOpenMeteo.last_attempt_at);
  assert.ok(successOpenMeteo.last_success_at);
  assert.strictEqual(successOpenMeteo.consecutive_failures, 0);
  assert.strictEqual(successOpenMeteo.last_error, null);
  assert.strictEqual(successOpenMeteo.retry_after, null);

  // Verify immutability
  assert.strictEqual(initialOpenMeteo.status, PROVIDER_STATUS.UNKNOWN);

  // 3. Mark failure
  const failedOpenMeteo = markProviderFailure(successOpenMeteo, {
    error: "Connection timeout",
    status: PROVIDER_STATUS.DOWN,
    latencyMs: 15000
  });
  assert.strictEqual(failedOpenMeteo.status, PROVIDER_STATUS.DOWN);
  assert.strictEqual(failedOpenMeteo.consecutive_failures, 1);
  assert.strictEqual(failedOpenMeteo.last_error, "Connection timeout");
  assert.strictEqual(failedOpenMeteo.latency_ms, 15000);
  assert.strictEqual(failedOpenMeteo.retry_after, null);
  // Ensure last_success_at was not overwritten
  assert.strictEqual(
    failedOpenMeteo.last_success_at,
    successOpenMeteo.last_success_at
  );

  // 4. Create "searoutes" and mark credential pending
  const initialSeaRoutes = createProviderHealthRecord("searoutes");
  const pendingSeaRoutes = markCredentialPending(initialSeaRoutes);
  assert.strictEqual(
    pendingSeaRoutes.status,
    PROVIDER_STATUS.CREDENTIAL_PENDING
  );
  assert.ok(pendingSeaRoutes.last_attempt_at);
  assert.strictEqual(pendingSeaRoutes.consecutive_failures, 0);
  assert.strictEqual(pendingSeaRoutes.latency_ms, null);
  assert.strictEqual(pendingSeaRoutes.last_error, null);
  assert.strictEqual(pendingSeaRoutes.retry_after, null);

  // 5. Create "gdelt" and mark rate limited
  const initialGdelt = createProviderHealthRecord("gdelt");
  const rateLimitedGdelt = markRateLimited(initialGdelt, {
    error: "GDELT rate limit reached",
    retryAfter: 5
  });
  assert.strictEqual(rateLimitedGdelt.status, PROVIDER_STATUS.RATE_LIMITED);
  assert.strictEqual(rateLimitedGdelt.last_error, "GDELT rate limit reached");
  assert.strictEqual(rateLimitedGdelt.retry_after, 5);
  assert.strictEqual(rateLimitedGdelt.consecutive_failures, 1);

  // Verify successful records clear retry_after when recovering
  const recoveredGdelt = markProviderSuccess(rateLimitedGdelt, 210);
  assert.strictEqual(recoveredGdelt.status, PROVIDER_STATUS.UP);
  assert.strictEqual(recoveredGdelt.retry_after, null);
  assert.strictEqual(recoveredGdelt.consecutive_failures, 0);

  // 6. Run staleness helper
  // Case A: No prior success -> always stale
  assert.strictEqual(isProviderDataStale(initialOpenMeteo, 60000), true);

  // Case B: Recent success within maxAge -> fresh
  assert.strictEqual(isProviderDataStale(successOpenMeteo, 60000), false);

  // Case C: Simulated old success -> stale
  const oldRecord = {
    ...successOpenMeteo,
    last_success_at: new Date(Date.now() - 100000).toISOString()
  };
  assert.strictEqual(isProviderDataStale(oldRecord, 50000), true);

  console.log("Provider health tests passed.");
}

runTests();
