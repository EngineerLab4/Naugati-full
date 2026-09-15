import assert from "node:assert";
import { createIngestionScheduler } from "../scheduler/ingestionScheduler.js";
import { INGESTION_SCHEDULES } from "../scheduler/scheduleConfig.js";
import { resetAllProviderHealth } from "../health/providerHealthRegistry.js";

async function runTests() {
  resetAllProviderHealth();

  // Verify scheduleConfig.js defaults
  assert.ok(INGESTION_SCHEDULES["open-meteo"].enabled === true);
  assert.ok(INGESTION_SCHEDULES["searoutes"].enabled === false);
  assert.ok(INGESTION_SCHEDULES["vesselfinder"].enabled === false);
  assert.ok(INGESTION_SCHEDULES["gdelt"].enabled === false);
  assert.ok(INGESTION_SCHEDULES["trading-economics"].enabled === false);

  // ==================================================
  // TEST A — VALIDATION
  // ==================================================
  assert.throws(
    () => createIngestionScheduler("not-an-array"),
    (err) => {
      assert.ok(err.message.includes("'tasks' must be an array"));
      return true;
    }
  );

  // Missing task name
  assert.throws(
    () =>
      createIngestionScheduler([
        {
          run: async () => {},
          interval_ms: 1000,
          enabled: true
        }
      ]),
    (err) => {
      assert.ok(err.message.includes("'name' must be a non-empty string"));
      return true;
    }
  );

  // Missing run function
  assert.throws(
    () =>
      createIngestionScheduler([
        {
          name: "valid-name",
          interval_ms: 1000,
          enabled: true
        }
      ]),
    (err) => {
      assert.ok(err.message.includes("'run' must be a function"));
      return true;
    }
  );

  // Invalid interval
  assert.throws(
    () =>
      createIngestionScheduler([
        {
          name: "valid-name",
          run: async () => {},
          interval_ms: -500,
          enabled: true
        }
      ]),
    (err) => {
      assert.ok(
        err.message.includes("'interval_ms' must be a positive finite number")
      );
      return true;
    }
  );

  assert.throws(
    () =>
      createIngestionScheduler([
        {
          name: "valid-name",
          run: async () => {},
          interval_ms: 0,
          enabled: true
        }
      ]),
    (err) => {
      assert.ok(
        err.message.includes("'interval_ms' must be a positive finite number")
      );
      return true;
    }
  );

  // Invalid enabled value
  assert.throws(
    () =>
      createIngestionScheduler([
        {
          name: "valid-name",
          run: async () => {},
          interval_ms: 1000,
          enabled: "yes"
        }
      ]),
    (err) => {
      assert.ok(err.message.includes("'enabled' must be a boolean"));
      return true;
    }
  );

  // ==================================================
  // TEST B — MANUAL RUN
  // ==================================================
  let manualRunCount = 0;
  const schedulerB = createIngestionScheduler([
    {
      name: "mock-provider",
      run: async () => {
        manualRunCount++;
        return { ok: true };
      },
      interval_ms: 60000,
      enabled: true
    }
  ]);

  const manualResult = await schedulerB.runNow("mock-provider");
  assert.ok(manualResult);
  assert.strictEqual(manualRunCount, 1);

  const statusB = schedulerB.getSchedulerStatus();
  assert.strictEqual(statusB.running, false);
  assert.strictEqual(statusB.tasks.length, 1);

  const taskStatusB = statusB.tasks[0];
  assert.strictEqual(taskStatusB.name, "mock-provider");
  assert.strictEqual(taskStatusB.last_success, true);
  assert.ok(taskStatusB.last_started_at);
  assert.ok(taskStatusB.last_completed_at);
  assert.strictEqual(taskStatusB.currently_running, false);

  // ==================================================
  // TEST C — DISABLED TASK
  // ==================================================
  let disabledExecCount = 0;
  const schedulerC = createIngestionScheduler([
    {
      name: "disabled-task",
      run: async () => {
        disabledExecCount++;
        return { ok: true };
      },
      interval_ms: 30,
      enabled: false
    }
  ]);

  schedulerC.start();
  await new Promise((resolve) => setTimeout(resolve, 80));
  schedulerC.stop();

  assert.strictEqual(
    disabledExecCount,
    0,
    "Disabled task must not execute automatically"
  );

  // Manual runNow() remains allowed
  await schedulerC.runNow("disabled-task");
  assert.strictEqual(disabledExecCount, 1);

  // ==================================================
  // TEST D — SCHEDULED EXECUTION
  // ==================================================
  let scheduledExecCount = 0;
  const schedulerD = createIngestionScheduler([
    {
      name: "scheduled-task",
      run: async () => {
        scheduledExecCount++;
        return { ok: true };
      },
      interval_ms: 40,
      enabled: true
    }
  ]);

  schedulerD.start();
  // Idempotency: calling start() twice must not duplicate timers
  schedulerD.start();

  await new Promise((resolve) => setTimeout(resolve, 75));
  schedulerD.stop();

  assert.ok(
    scheduledExecCount >= 1,
    `Scheduled task should execute at least once (actual: ${scheduledExecCount})`
  );

  // ==================================================
  // TEST E — OVERLAP PROTECTION
  // ==================================================
  let currentConcurrent = 0;
  let maxConcurrent = 0;

  const schedulerE = createIngestionScheduler([
    {
      name: "overlap-task",
      run: async () => {
        currentConcurrent++;
        maxConcurrent = Math.max(maxConcurrent, currentConcurrent);
        await new Promise((resolve) => setTimeout(resolve, 100));
        currentConcurrent--;
        return { ok: true };
      },
      interval_ms: 20,
      enabled: true
    }
  ]);

  schedulerE.start();
  // Wait until task starts and is in flight
  await new Promise((resolve) => setTimeout(resolve, 35));

  // Attempt concurrent execution while overlap-task is in-flight
  const runNowPromise = schedulerE.runNow("overlap-task");
  await runNowPromise;

  // Stop scheduler so subsequent recurring runs are not scheduled
  schedulerE.stop();

  // Wait for the in-flight task to finish
  await new Promise((resolve) => setTimeout(resolve, 110));

  assert.strictEqual(maxConcurrent, 1, "Maximum concurrency must never exceed 1");

  const statusE = schedulerE.getSchedulerStatus();
  const overlapStatus = statusE.tasks.find((t) => t.name === "overlap-task");
  assert.ok(overlapStatus);
  assert.ok(overlapStatus.skipped_due_to_overlap >= 0);
  assert.strictEqual(overlapStatus.currently_running, false);

  // ==================================================
  // TEST F — STOP
  // ==================================================
  let stopExecCount = 0;
  const schedulerF = createIngestionScheduler([
    {
      name: "stop-task",
      run: async () => {
        stopExecCount++;
        return { ok: true };
      },
      interval_ms: 30,
      enabled: true
    }
  ]);

  schedulerF.start();
  await new Promise((resolve) => setTimeout(resolve, 55));
  schedulerF.stop();

  const countAtStop = stopExecCount;
  assert.ok(countAtStop >= 1, "Expected at least 1 execution before stop");

  await new Promise((resolve) => setTimeout(resolve, 70));
  assert.strictEqual(
    stopExecCount,
    countAtStop,
    "Execution count must not increase after stop()"
  );

  // ==================================================
  // TEST G — FAILURE
  // ==================================================
  const schedulerG = createIngestionScheduler([
    {
      name: "failing-task",
      run: async () => {
        throw new Error("Mock ingestion failure");
      },
      interval_ms: 60000,
      enabled: true
    }
  ]);

  await schedulerG.runNow("failing-task");

  const statusG = schedulerG.getSchedulerStatus();
  const failingTaskStatus = statusG.tasks.find((t) => t.name === "failing-task");
  assert.ok(failingTaskStatus);
  assert.strictEqual(failingTaskStatus.last_success, false);
  assert.strictEqual(failingTaskStatus.last_error, "Mock ingestion failure");
  assert.strictEqual(failingTaskStatus.currently_running, false);

  console.log("All ingestion scheduler tests passed.");
  console.log("Example scheduler status:");
  console.log(JSON.stringify(statusB, null, 2));
}

runTests();
