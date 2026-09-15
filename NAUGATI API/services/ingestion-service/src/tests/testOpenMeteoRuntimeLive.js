import assert from "node:assert";
import "dotenv/config";
import { loadRuntimeConfig } from "../config/runtimeConfig.js";
import { createIngestionRuntime } from "../runtime/createIngestionRuntime.js";

async function runTest() {
  if (process.env.RUN_OPEN_METEO_RUNTIME_LIVE_TEST !== "true") {
    console.log("Open-Meteo runtime live test skipped.");
    return;
  }

  const baseConfig = loadRuntimeConfig();

  if (!baseConfig.ingestion?.weather) {
    throw new Error(
      "OPEN_METEO_LATITUDE and OPEN_METEO_LONGITUDE must be set in environment for live test."
    );
  }

  const config = {
    schedulerEnabled: true,
    runOnStart: true,
    ingestion: {
      weather: baseConfig.ingestion.weather
    }
  };

  const runtime = createIngestionRuntime(config);

  try {
    const startResult = await runtime.start();

    assert.strictEqual(startResult.started, true);
    assert.strictEqual(startResult.scheduler_enabled, true);
    assert.strictEqual(
      startResult.initial_runs.length,
      1,
      "Expected exactly one initial task execution."
    );

    const initialRun = startResult.initial_runs[0];
    assert.strictEqual(initialRun.task, "open-meteo");

    const pipelineReport = initialRun.report;
    assert.ok(pipelineReport, "Pipeline report must exist.");

    assert.strictEqual(pipelineReport.totals.total, 1);
    assert.strictEqual(pipelineReport.totals.succeeded, 1);
    assert.strictEqual(pipelineReport.totals.failed, 0);

    const taskResult = pipelineReport.results?.[0];
    assert.ok(taskResult, "Task result must exist in pipeline report.");
    assert.strictEqual(taskResult.success, true);
    assert.strictEqual(taskResult.data?.provider, "open-meteo");

    const openMeteoHealth = pipelineReport.provider_health?.providers?.find(
      (p) => p.provider === "open-meteo"
    );
    assert.ok(openMeteoHealth, "Open-Meteo health record must exist.");
    assert.strictEqual(openMeteoHealth.status, "UP");
    assert.ok(
      openMeteoHealth.last_success_at,
      "Open-Meteo last_success_at must be populated."
    );

    console.log("Open-Meteo runtime live test passed successfully.");
  } finally {
    runtime.stop();
  }
}

runTest();
