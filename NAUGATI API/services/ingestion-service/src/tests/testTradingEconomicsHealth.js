import assert from "node:assert";
import "dotenv/config";
import {
  fetchCommodityMarkets,
  fetchMarketSymbol
} from "../integrations/market/tradingEconomics.service.js";
import {
  getProviderHealth,
  resetProviderHealth
} from "../health/providerHealthRegistry.js";

async function runTests() {
  // TEST A: CREDENTIAL PENDING (fetchCommodityMarkets)
  resetProviderHealth("trading-economics");

  await assert.rejects(
    async () => {
      await fetchCommodityMarkets();
    },
    (err) => {
      assert.ok(
        err.message.includes("Trading Economics API key is missing.")
      );
      return true;
    }
  );

  const health = getProviderHealth("trading-economics");
  assert.strictEqual(health.status, "CREDENTIAL_PENDING");
  assert.ok(health.last_attempt_at);
  assert.strictEqual(health.last_success_at, null);
  assert.strictEqual(health.latency_ms, null);
  assert.strictEqual(health.last_error, null);
  assert.strictEqual(health.retry_after, null);
  assert.strictEqual(health.consecutive_failures, 0);

  // TEST B: INVALID SYMBOL INPUT (Caller error must not affect provider health)
  resetProviderHealth("trading-economics");

  await assert.rejects(
    async () => {
      await fetchMarketSymbol("");
    },
    (err) => {
      assert.ok(err.message.includes("Invalid input"));
      return true;
    }
  );

  const uncalledHealth = getProviderHealth("trading-economics");
  assert.strictEqual(uncalledHealth.status, "UNKNOWN");
  assert.strictEqual(uncalledHealth.last_attempt_at, null);
  assert.strictEqual(uncalledHealth.consecutive_failures, 0);

  // TEST C: VALID SYMBOL + NO CREDENTIAL
  resetProviderHealth("trading-economics");

  await assert.rejects(
    async () => {
      await fetchMarketSymbol("TEST");
    },
    (err) => {
      assert.ok(
        err.message.includes("Trading Economics API key is missing.")
      );
      return true;
    }
  );

  const symbolHealth = getProviderHealth("trading-economics");
  assert.strictEqual(symbolHealth.status, "CREDENTIAL_PENDING");
  assert.ok(symbolHealth.last_attempt_at);
  assert.strictEqual(symbolHealth.last_success_at, null);
  assert.strictEqual(symbolHealth.consecutive_failures, 0);

  console.log("Naugati Trading Economics health integration passed.");
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
