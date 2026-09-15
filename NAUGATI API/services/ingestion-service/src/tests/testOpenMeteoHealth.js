import assert from "node:assert";
import { fetchMarineWeather } from "../integrations/weather/openMeteo.service.js";
import {
  getProviderHealth,
  resetProviderHealth
} from "../health/providerHealthRegistry.js";

async function runTests() {
  // Test 1: Live Health Call
  resetProviderHealth("open-meteo");

  const weather = await fetchMarineWeather({
    latitude: 20.316,
    longitude: 86.611
  });

  assert.ok(weather, "Weather response should exist.");
  assert.strictEqual(weather.provider, "open-meteo");

  // Confirm weather response does not leak provider health fields
  assert.strictEqual(weather.status, undefined);
  assert.strictEqual(weather.latency_ms, undefined);
  assert.strictEqual(weather.last_success_at, undefined);
  assert.strictEqual(weather.consecutive_failures, undefined);
  assert.strictEqual(weather.last_error, undefined);

  const health = getProviderHealth("open-meteo");

  assert.strictEqual(health.status, "UP");
  assert.strictEqual(typeof health.latency_ms, "number");
  assert.ok(health.latency_ms >= 0);
  assert.ok(health.last_attempt_at);
  assert.ok(health.last_success_at);
  assert.strictEqual(health.last_error, null);
  assert.strictEqual(health.consecutive_failures, 0);

  console.log("Naugati Open-Meteo health integration passed.");
  console.log("Safe health summary:");
  console.log(
    JSON.stringify(
      {
        provider: health.provider,
        status: health.status,
        latency_ms: health.latency_ms,
        last_success_at: health.last_success_at
      },
      null,
      2
    )
  );

  // Test 2: Invalid Input Test (must not affect provider health)
  resetProviderHealth("open-meteo");

  await assert.rejects(
    async () => {
      await fetchMarineWeather({
        latitude: 200,
        longitude: 86
      });
    },
    (err) => {
      assert.ok(err.message.includes("Invalid input"));
      return true;
    }
  );

  const uncalledHealth = getProviderHealth("open-meteo");
  assert.strictEqual(uncalledHealth.status, "UNKNOWN");
  assert.strictEqual(uncalledHealth.last_attempt_at, null);
  assert.strictEqual(uncalledHealth.consecutive_failures, 0);
}

runTests();
