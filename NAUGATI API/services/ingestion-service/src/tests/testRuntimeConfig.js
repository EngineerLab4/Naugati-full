import assert from "node:assert";
import { loadRuntimeConfig } from "../config/runtimeConfig.js";

async function runTests() {
  const originalEnv = { ...process.env };

  try {
    // ==================================================
    // TEST A — NO VARIABLES (defaults)
    // ==================================================
    const configA = loadRuntimeConfig({});

    assert.strictEqual(configA.schedulerEnabled, false);
    assert.strictEqual(configA.runOnStart, false);
    assert.strictEqual(configA.ingestion.weather, null);

    // ==================================================
    // TEST B — VALID CONFIGURATION
    // ==================================================
    const configB = loadRuntimeConfig({
      INGESTION_SCHEDULER_ENABLED: "true",
      INGESTION_RUN_ON_START: "false",
      OPEN_METEO_LATITUDE: "20.316",
      OPEN_METEO_LONGITUDE: "86.611"
    });

    assert.strictEqual(configB.schedulerEnabled, true);
    assert.strictEqual(configB.runOnStart, false);
    assert.ok(configB.ingestion.weather);
    assert.strictEqual(configB.ingestion.weather.latitude, 20.316);
    assert.strictEqual(configB.ingestion.weather.longitude, 86.611);

    // Case-insensitive boolean test
    const configBCase = loadRuntimeConfig({
      INGESTION_SCHEDULER_ENABLED: "TRUE",
      INGESTION_RUN_ON_START: "False"
    });
    assert.strictEqual(configBCase.schedulerEnabled, true);
    assert.strictEqual(configBCase.runOnStart, false);

    // ==================================================
    // TEST C — INVALID LATITUDE
    // ==================================================
    assert.throws(
      () =>
        loadRuntimeConfig({
          OPEN_METEO_LATITUDE: "200",
          OPEN_METEO_LONGITUDE: "86.611"
        }),
      (err) => {
        assert.ok(err.message.includes("Invalid latitude"));
        return true;
      }
    );

    // ==================================================
    // TEST D — INVALID LONGITUDE
    // ==================================================
    assert.throws(
      () =>
        loadRuntimeConfig({
          OPEN_METEO_LATITUDE: "20.316",
          OPEN_METEO_LONGITUDE: "500"
        }),
      (err) => {
        assert.ok(err.message.includes("Invalid longitude"));
        return true;
      }
    );

    // ==================================================
    // TEST E — ONLY LATITUDE PRESENT
    // ==================================================
    assert.throws(
      () =>
        loadRuntimeConfig({
          OPEN_METEO_LATITUDE: "20.316"
        }),
      (err) => {
        assert.ok(
          err.message.includes("OPEN_METEO_LATITUDE was provided without OPEN_METEO_LONGITUDE")
        );
        return true;
      }
    );

    // ==================================================
    // TEST F — ONLY LONGITUDE PRESENT
    // ==================================================
    assert.throws(
      () =>
        loadRuntimeConfig({
          OPEN_METEO_LONGITUDE: "86.611"
        }),
      (err) => {
        assert.ok(
          err.message.includes("OPEN_METEO_LONGITUDE was provided without OPEN_METEO_LATITUDE")
        );
        return true;
      }
    );

    // ==================================================
    // TEST G — INVALID BOOLEAN
    // ==================================================
    assert.throws(
      () =>
        loadRuntimeConfig({
          INGESTION_SCHEDULER_ENABLED: "yes"
        }),
      (err) => {
        assert.ok(err.message.includes("Invalid boolean value"));
        return true;
      }
    );

    assert.throws(
      () =>
        loadRuntimeConfig({
          INGESTION_RUN_ON_START: "1"
        }),
      (err) => {
        assert.ok(err.message.includes("Invalid boolean value"));
        return true;
      }
    );

    console.log("All runtime configuration tests passed.");
    console.log("Example valid parsed runtime config:");
    console.log(JSON.stringify(configB, null, 2));
  } finally {
    process.env = originalEnv;
  }
}

runTests();
