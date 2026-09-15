import assert from "node:assert";
import { createIngestionRuntime } from "../runtime/createIngestionRuntime.js";

async function runTests() {
  // ==================================================
  // TEST A — DISABLED RUNTIME
  // ==================================================
  const runtimeA = createIngestionRuntime({
    schedulerEnabled: false,
    runOnStart: false,
    ingestion: {}
  });

  const resultA = await runtimeA.start();

  assert.strictEqual(resultA.started, false);
  assert.strictEqual(resultA.scheduler_enabled, false);
  assert.strictEqual(resultA.initial_runs.length, 0);
  assert.strictEqual(runtimeA.status().scheduler.running, false);

  // ==================================================
  // TEST B — DISABLED + RUN ON START
  // ==================================================
  const runtimeB = createIngestionRuntime({
    schedulerEnabled: false,
    runOnStart: true,
    ingestion: {}
  });

  const resultB = await runtimeB.start();

  assert.strictEqual(resultB.started, false);
  assert.strictEqual(resultB.scheduler_enabled, false);
  assert.strictEqual(resultB.initial_runs.length, 0);
  assert.strictEqual(runtimeB.status().scheduler.running, false);

  // ==================================================
  // TEST C — ENABLED WITH NO TASKS
  // ==================================================
  const runtimeC = createIngestionRuntime({
    schedulerEnabled: true,
    runOnStart: false,
    ingestion: {}
  });

  const resultC = await runtimeC.start();

  assert.strictEqual(resultC.started, true);
  assert.strictEqual(resultC.scheduler_enabled, true);
  assert.strictEqual(runtimeC.status().configured_task_count, 0);
  assert.strictEqual(runtimeC.status().scheduler.running, true);

  runtimeC.stop();
  assert.strictEqual(runtimeC.status().scheduler.running, false);

  // ==================================================
  // TEST D — STATUS STRUCTURE
  // ==================================================
  const statusC = runtimeC.status();
  assert.ok("scheduler_enabled" in statusC);
  assert.ok("configured_task_count" in statusC);
  assert.ok("configured_tasks" in statusC);
  assert.ok("scheduler" in statusC);
  assert.ok(Array.isArray(statusC.configured_tasks));

  // ==================================================
  // TEST E — STOP IS SAFE
  // ==================================================
  const runtimeE = createIngestionRuntime({
    schedulerEnabled: false,
    runOnStart: false,
    ingestion: {}
  });

  assert.doesNotThrow(() => {
    runtimeE.stop();
  });

  console.log("All ingestion runtime lifecycle tests passed.");
}

runTests();
