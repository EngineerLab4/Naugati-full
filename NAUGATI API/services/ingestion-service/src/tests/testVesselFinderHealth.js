import assert from "node:assert";
import "dotenv/config";
import { fetchVesselPosition } from "../integrations/ais/vesselFinder.service.js";
import {
  getProviderHealth,
  resetProviderHealth
} from "../health/providerHealthRegistry.js";

async function runTests() {
  // TEST A: CREDENTIAL PENDING
  resetProviderHealth("vesselfinder");

  await assert.rejects(
    async () => {
      await fetchVesselPosition({
        imo: 1234567
      });
    },
    (err) => {
      assert.ok(
        err.message.includes("VesselFinder API key is missing.")
      );
      return true;
    }
  );

  const health = getProviderHealth("vesselfinder");
  assert.strictEqual(health.status, "CREDENTIAL_PENDING");
  assert.ok(health.last_attempt_at);
  assert.strictEqual(health.last_success_at, null);
  assert.strictEqual(health.latency_ms, null);
  assert.strictEqual(health.last_error, null);
  assert.strictEqual(health.retry_after, null);
  assert.strictEqual(health.consecutive_failures, 0);

  // TEST B: INVALID CALLER INPUT
  resetProviderHealth("vesselfinder");

  await assert.rejects(
    async () => {
      await fetchVesselPosition({
        imo: 123
      });
    },
    (err) => {
      assert.ok(err.message.includes("Invalid input"));
      return true;
    }
  );

  const uncalledHealth = getProviderHealth("vesselfinder");
  assert.strictEqual(uncalledHealth.status, "UNKNOWN");
  assert.strictEqual(uncalledHealth.last_attempt_at, null);
  assert.strictEqual(uncalledHealth.consecutive_failures, 0);

  console.log("Naugati VesselFinder health integration passed.");
  console.log("Safe health summary:");
  console.log(
    JSON.stringify(
      {
        provider: health.provider,
        status: health.status,
        last_attempt_at: health.last_attempt_at,
        consecutive_failures: health.consecutive_failures
      },
      null,
      2
    )
  );
}

runTests();
