import assert from "node:assert";
import "dotenv/config";
import { fetchMaritimeRoute } from "../integrations/routing/seaRoutes.service.js";
import {
  getProviderHealth,
  resetProviderHealth
} from "../health/providerHealthRegistry.js";

async function runTests() {
  // TEST A: CREDENTIAL PENDING
  resetProviderHealth("searoutes");

  await assert.rejects(
    async () => {
      await fetchMaritimeRoute({
        origin: {
          latitude: -23.8167,
          longitude: 151.2833
        },
        destination: {
          latitude: 20.316,
          longitude: 86.611
        }
      });
    },
    (err) => {
      assert.ok(
        err.message.includes(
          "SeaRoutes API key is missing. Please set SEAROUTES_API_KEY in your environment (.env file)."
        )
      );
      return true;
    }
  );

  const health = getProviderHealth("searoutes");
  assert.strictEqual(health.status, "CREDENTIAL_PENDING");
  assert.ok(health.last_attempt_at);
  assert.strictEqual(health.last_success_at, null);
  assert.strictEqual(health.latency_ms, null);
  assert.strictEqual(health.last_error, null);
  assert.strictEqual(health.retry_after, null);
  assert.strictEqual(health.consecutive_failures, 0);

  // TEST B: INVALID INPUT (Caller error must not affect provider health)
  resetProviderHealth("searoutes");

  await assert.rejects(
    async () => {
      await fetchMaritimeRoute({
        origin: {
          latitude: 200,
          longitude: 151
        },
        destination: {
          latitude: 20,
          longitude: 86
        }
      });
    },
    (err) => {
      assert.ok(err.message.includes("Invalid input"));
      return true;
    }
  );

  const uncalledHealth = getProviderHealth("searoutes");
  assert.strictEqual(uncalledHealth.status, "UNKNOWN");
  assert.strictEqual(uncalledHealth.last_attempt_at, null);
  assert.strictEqual(uncalledHealth.consecutive_failures, 0);

  console.log("Naugati SeaRoutes health integration passed.");
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
