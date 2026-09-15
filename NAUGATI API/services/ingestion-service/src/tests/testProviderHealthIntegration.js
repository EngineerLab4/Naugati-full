import assert from "node:assert";
import { withProviderHealth } from "../health/withProviderHealth.js";
import {
  getProviderHealth,
  getAllProviderHealth,
  resetAllProviderHealth
} from "../health/providerHealthRegistry.js";
import { PROVIDER_STATUS } from "../health/providerHealth.js";

async function runTests() {
  resetAllProviderHealth();

  // A. SUCCESS
  const successResult = await withProviderHealth("mock-success", async () => {
    return { ok: true };
  });
  assert.deepStrictEqual(successResult, { ok: true });

  const successRecord = getProviderHealth("mock-success");
  assert.strictEqual(successRecord.status, PROVIDER_STATUS.UP);
  assert.strictEqual(typeof successRecord.latency_ms, "number");
  assert.ok(successRecord.last_success_at);
  assert.ok(successRecord.last_attempt_at);
  assert.strictEqual(successRecord.consecutive_failures, 0);
  assert.strictEqual(successRecord.last_error, null);

  // B. CREDENTIAL PENDING
  const credentialError = new Error(
    "SeaRoutes API key is missing. Please set SEAROUTES_API_KEY."
  );
  await assert.rejects(
    async () => {
      await withProviderHealth("mock-credential", async () => {
        throw credentialError;
      });
    },
    (err) => {
      assert.strictEqual(err, credentialError);
      return true;
    }
  );

  const credentialRecord = getProviderHealth("mock-credential");
  assert.strictEqual(
    credentialRecord.status,
    PROVIDER_STATUS.CREDENTIAL_PENDING
  );
  assert.strictEqual(credentialRecord.consecutive_failures, 0);
  assert.ok(credentialRecord.last_attempt_at);

  // C. RATE LIMIT
  const rateLimitError = new Error(
    "GDELT rate limit reached. Wait before making another request."
  );
  await assert.rejects(
    async () => {
      await withProviderHealth("mock-rate-limit", async () => {
        throw rateLimitError;
      });
    },
    (err) => {
      assert.strictEqual(err, rateLimitError);
      return true;
    }
  );

  const rateLimitRecord = getProviderHealth("mock-rate-limit");
  assert.strictEqual(rateLimitRecord.status, PROVIDER_STATUS.RATE_LIMITED);
  assert.strictEqual(rateLimitRecord.consecutive_failures, 1);
  assert.strictEqual(
    rateLimitRecord.last_error,
    "GDELT rate limit reached. Wait before making another request."
  );

  // D. GENERIC FAILURE
  const genericError = new Error("Provider connection failed");
  await assert.rejects(
    async () => {
      await withProviderHealth("mock-down", async () => {
        throw genericError;
      });
    },
    (err) => {
      assert.strictEqual(err, genericError);
      return true;
    }
  );

  const downRecord = getProviderHealth("mock-down");
  assert.strictEqual(downRecord.status, PROVIDER_STATUS.DOWN);
  assert.strictEqual(downRecord.consecutive_failures, 1);
  assert.strictEqual(downRecord.last_error, "Provider connection failed");

  // E. CONCURRENCY SAFETY
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const concurrentCall1 = withProviderHealth("mock-concurrent", async () => {
    await sleep(20);
    throw new Error("Concurrent failure 1");
  });
  const concurrentCall2 = withProviderHealth("mock-concurrent", async () => {
    await sleep(40);
    throw new Error("Concurrent failure 2");
  });

  const results = await Promise.allSettled([concurrentCall1, concurrentCall2]);
  assert.strictEqual(results[0].status, "rejected");
  assert.strictEqual(results[1].status, "rejected");

  const concurrentRecord = getProviderHealth("mock-concurrent");
  assert.strictEqual(concurrentRecord.status, PROVIDER_STATUS.DOWN);
  assert.strictEqual(concurrentRecord.consecutive_failures, 2);
  assert.ok(
    concurrentRecord.last_error === "Concurrent failure 1" ||
      concurrentRecord.last_error === "Concurrent failure 2"
  );

  // F. REGISTRY
  const allProviders = getAllProviderHealth();
  const providerNames = allProviders.map((p) => p.provider);
  assert.ok(providerNames.includes("mock-success"));
  assert.ok(providerNames.includes("mock-credential"));
  assert.ok(providerNames.includes("mock-rate-limit"));
  assert.ok(providerNames.includes("mock-down"));
  assert.ok(providerNames.includes("mock-concurrent"));
  assert.strictEqual(allProviders.length, 5);

  resetAllProviderHealth();
  const clearedProviders = getAllProviderHealth();
  assert.strictEqual(clearedProviders.length, 0);

  console.log("Provider health integration tests passed.");
}

runTests();
