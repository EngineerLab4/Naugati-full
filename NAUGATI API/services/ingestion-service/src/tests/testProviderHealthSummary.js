import assert from "node:assert";
import {
  KNOWN_PROVIDERS,
  PROVIDER_FRESHNESS_CONFIG,
  getProviderHealthSummary,
  initializeKnownProviders
} from "../health/providerHealthSummary.js";
import {
  PROVIDER_STATUS,
  markProviderSuccess,
  markCredentialPending,
  markRateLimited
} from "../health/providerHealth.js";
import {
  getProviderHealth,
  setProviderHealth,
  resetAllProviderHealth
} from "../health/providerHealthRegistry.js";

async function runTests() {
  // Start fresh
  resetAllProviderHealth();

  // ==================================================
  // TEST A — INITIAL SUMMARY
  // ==================================================
  const initialSummary = getProviderHealthSummary();

  assert.strictEqual(initialSummary.totals.total, 5);
  assert.strictEqual(initialSummary.totals.unknown, 5);
  assert.strictEqual(initialSummary.totals.up, 0);
  assert.strictEqual(initialSummary.totals.down, 0);
  assert.strictEqual(initialSummary.totals.degraded, 0);
  assert.strictEqual(initialSummary.totals.rate_limited, 0);
  assert.strictEqual(initialSummary.totals.credential_pending, 0);

  assert.strictEqual(initialSummary.providers.length, 5);

  const providerNames = initialSummary.providers.map((p) => p.provider);
  for (const known of KNOWN_PROVIDERS) {
    const occurrences = providerNames.filter((name) => name === known);
    assert.strictEqual(
      occurrences.length,
      1,
      `Expected ${known} to appear exactly once in initial summary`
    );
  }

  for (const item of initialSummary.providers) {
    assert.strictEqual(
      item.status,
      PROVIDER_STATUS.UNKNOWN,
      `Expected status of ${item.provider} to be UNKNOWN`
    );
    assert.strictEqual(
      item.stale,
      true,
      `Expected stale to be true for ${item.provider} before any success`
    );
    assert.strictEqual(item.last_success_at, null);
    assert.strictEqual(item.latency_ms, null);
    assert.strictEqual(item.last_error, null);
    assert.strictEqual(item.retry_after, null);
    assert.strictEqual(item.consecutive_failures, 0);
  }

  // ==================================================
  // TEST B — MIXED PROVIDER STATES
  // ==================================================
  setProviderHealth(
    "open-meteo",
    markProviderSuccess(getProviderHealth("open-meteo"), 250)
  );

  setProviderHealth(
    "searoutes",
    markCredentialPending(getProviderHealth("searoutes"))
  );

  setProviderHealth(
    "gdelt",
    markRateLimited(getProviderHealth("gdelt"), {
      error: "Rate limited",
      retryAfter: "5"
    })
  );

  // vesselfinder and trading-economics remain UNKNOWN

  const mixedSummary = getProviderHealthSummary();

  assert.strictEqual(mixedSummary.totals.total, 5);
  assert.strictEqual(mixedSummary.totals.up, 1);
  assert.strictEqual(mixedSummary.totals.credential_pending, 1);
  assert.strictEqual(mixedSummary.totals.rate_limited, 1);
  assert.strictEqual(mixedSummary.totals.unknown, 2);
  assert.strictEqual(mixedSummary.totals.down, 0);
  assert.strictEqual(mixedSummary.totals.degraded, 0);

  const openMeteo = mixedSummary.providers.find(
    (p) => p.provider === "open-meteo"
  );
  assert.ok(openMeteo);
  assert.strictEqual(openMeteo.status, PROVIDER_STATUS.UP);
  assert.strictEqual(openMeteo.latency_ms, 250);
  assert.strictEqual(openMeteo.stale, false);

  const seaRoutes = mixedSummary.providers.find(
    (p) => p.provider === "searoutes"
  );
  assert.ok(seaRoutes);
  assert.strictEqual(seaRoutes.status, PROVIDER_STATUS.CREDENTIAL_PENDING);

  const gdelt = mixedSummary.providers.find((p) => p.provider === "gdelt");
  assert.ok(gdelt);
  assert.strictEqual(gdelt.status, PROVIDER_STATUS.RATE_LIMITED);
  assert.strictEqual(gdelt.retry_after, "5");

  const vesselFinder = mixedSummary.providers.find(
    (p) => p.provider === "vesselfinder"
  );
  assert.ok(vesselFinder);
  assert.strictEqual(vesselFinder.status, PROVIDER_STATUS.UNKNOWN);

  const tradingEconomics = mixedSummary.providers.find(
    (p) => p.provider === "trading-economics"
  );
  assert.ok(tradingEconomics);
  assert.strictEqual(tradingEconomics.status, PROVIDER_STATUS.UNKNOWN);

  // ==================================================
  // TEST C — SUMMARY IMMUTABILITY / NO MUTATION
  // ==================================================
  const beforeOpenMeteo = { ...getProviderHealth("open-meteo") };
  const beforeGdelt = { ...getProviderHealth("gdelt") };

  getProviderHealthSummary();

  const afterOpenMeteo = getProviderHealth("open-meteo");
  const afterGdelt = getProviderHealth("gdelt");

  assert.deepStrictEqual(
    {
      provider: afterOpenMeteo.provider,
      status: afterOpenMeteo.status,
      latency_ms: afterOpenMeteo.latency_ms,
      last_error: afterOpenMeteo.last_error,
      retry_after: afterOpenMeteo.retry_after,
      consecutive_failures: afterOpenMeteo.consecutive_failures
    },
    {
      provider: beforeOpenMeteo.provider,
      status: beforeOpenMeteo.status,
      latency_ms: beforeOpenMeteo.latency_ms,
      last_error: beforeOpenMeteo.last_error,
      retry_after: beforeOpenMeteo.retry_after,
      consecutive_failures: beforeOpenMeteo.consecutive_failures
    }
  );

  assert.deepStrictEqual(
    {
      provider: afterGdelt.provider,
      status: afterGdelt.status,
      latency_ms: afterGdelt.latency_ms,
      last_error: afterGdelt.last_error,
      retry_after: afterGdelt.retry_after,
      consecutive_failures: afterGdelt.consecutive_failures
    },
    {
      provider: beforeGdelt.provider,
      status: beforeGdelt.status,
      latency_ms: beforeGdelt.latency_ms,
      last_error: beforeGdelt.last_error,
      retry_after: beforeGdelt.retry_after,
      consecutive_failures: beforeGdelt.consecutive_failures
    }
  );

  console.log("Provider health summary tests passed.");
  console.log("Example generated summary (from local test state):");
  console.log(JSON.stringify(mixedSummary, null, 2));
}

runTests();
