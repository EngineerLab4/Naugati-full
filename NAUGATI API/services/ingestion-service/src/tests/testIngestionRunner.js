import assert from "node:assert";
import { runIngestionPipeline } from "../runner/ingestionRunner.js";
import { resetAllProviderHealth } from "../health/providerHealthRegistry.js";

async function runTests() {
  resetAllProviderHealth();

  // ==================================================
  // TEST A — ALL SUCCESSFUL
  // ==================================================
  const mockWeatherResult = {
    provider: "mock-weather",
    wave_height_m: 1.8,
    sea_surface_temp_c: 24.2
  };

  const mockMarketResult = {
    provider: "mock-market",
    brent_crude_usd: 82.5
  };

  const tasksA = [
    {
      name: "mock-weather",
      run: async () => mockWeatherResult
    },
    {
      name: "mock-market",
      run: async () => mockMarketResult
    }
  ];

  const reportA = await runIngestionPipeline(tasksA);

  assert.strictEqual(reportA.totals.total, 2);
  assert.strictEqual(reportA.totals.succeeded, 2);
  assert.strictEqual(reportA.totals.failed, 0);
  assert.strictEqual(reportA.results.length, 2);

  assert.strictEqual(reportA.results[0].name, "mock-weather");
  assert.strictEqual(reportA.results[0].success, true);
  assert.deepStrictEqual(reportA.results[0].data, mockWeatherResult);
  assert.strictEqual(reportA.results[0].error, null);

  assert.strictEqual(reportA.results[1].name, "mock-market");
  assert.strictEqual(reportA.results[1].success, true);
  assert.deepStrictEqual(reportA.results[1].data, mockMarketResult);
  assert.strictEqual(reportA.results[1].error, null);

  assert.ok(reportA.started_at);
  assert.ok(reportA.completed_at);
  assert.ok(typeof reportA.duration_ms === "number");
  assert.ok(reportA.provider_health);
  assert.strictEqual(reportA.provider_health.totals.total, 5);

  // ==================================================
  // TEST B — FAILURE + CONTINUE
  // ==================================================
  let task3Executed = false;

  const tasksB = [
    {
      name: "task-1",
      run: async () => ({ status: "ok-1" })
    },
    {
      name: "task-2",
      run: async () => {
        throw new Error("Mock provider failed");
      }
    },
    {
      name: "task-3",
      run: async () => {
        task3Executed = true;
        return { status: "ok-3" };
      }
    }
  ];

  const reportB = await runIngestionPipeline(tasksB, { continueOnError: true });

  assert.strictEqual(reportB.totals.total, 3);
  assert.strictEqual(reportB.totals.succeeded, 2);
  assert.strictEqual(reportB.totals.failed, 1);
  assert.strictEqual(task3Executed, true, "task-3 must have executed");

  const failedTask = reportB.results.find((r) => r.name === "task-2");
  assert.ok(failedTask);
  assert.strictEqual(failedTask.success, false);
  assert.strictEqual(failedTask.data, null);
  assert.strictEqual(failedTask.error, "Mock provider failed");

  // ==================================================
  // TEST C — FAILURE + STOP
  // ==================================================
  let taskCExecuted = false;

  const tasksC = [
    {
      name: "task-a",
      run: async () => ({ status: "ok-a" })
    },
    {
      name: "task-b",
      run: async () => {
        throw new Error("Critical mock provider failure");
      }
    },
    {
      name: "task-c",
      run: async () => {
        taskCExecuted = true;
        return { status: "ok-c" };
      }
    }
  ];

  const reportC = await runIngestionPipeline(tasksC, { continueOnError: false });

  assert.strictEqual(taskCExecuted, false, "task-c must NOT have executed");
  assert.strictEqual(reportC.totals.total, 2, "totals.total reflects executed tasks only");
  assert.strictEqual(reportC.totals.succeeded, 1);
  assert.strictEqual(reportC.totals.failed, 1);
  assert.strictEqual(reportC.results.length, 2);
  assert.strictEqual(reportC.results[0].name, "task-a");
  assert.strictEqual(reportC.results[1].name, "task-b");

  // ==================================================
  // TEST D — SEQUENTIAL EXECUTION
  // ==================================================
  const executionEvents = [];

  const tasksD = [
    {
      name: "task-seq-1",
      run: async () => {
        executionEvents.push("task1-start");
        await new Promise((resolve) => setTimeout(resolve, 30));
        executionEvents.push("task1-end");
        return { seq: 1 };
      }
    },
    {
      name: "task-seq-2",
      run: async () => {
        executionEvents.push("task2-start");
        executionEvents.push("task2-end");
        return { seq: 2 };
      }
    }
  ];

  await runIngestionPipeline(tasksD);

  assert.deepStrictEqual(executionEvents, [
    "task1-start",
    "task1-end",
    "task2-start",
    "task2-end"
  ]);

  // ==================================================
  // TEST E — VALIDATION
  // ==================================================
  await assert.rejects(
    async () => runIngestionPipeline(null),
    (err) => {
      assert.ok(err.message.includes("'tasks' must be an array"));
      return true;
    }
  );

  await assert.rejects(
    async () => runIngestionPipeline("not-an-array"),
    (err) => {
      assert.ok(err.message.includes("'tasks' must be an array"));
      return true;
    }
  );

  await assert.rejects(
    async () => runIngestionPipeline([{ run: async () => {} }]),
    (err) => {
      assert.ok(err.message.includes("task 'name' must be a non-empty string"));
      return true;
    }
  );

  await assert.rejects(
    async () => runIngestionPipeline([{ name: "   ", run: async () => {} }]),
    (err) => {
      assert.ok(err.message.includes("task 'name' must be a non-empty string"));
      return true;
    }
  );

  await assert.rejects(
    async () => runIngestionPipeline([{ name: "valid-name" }]),
    (err) => {
      assert.ok(err.message.includes("'run' must be a function"));
      return true;
    }
  );

  await assert.rejects(
    async () => runIngestionPipeline([{ name: "valid-name", run: "not-a-func" }]),
    (err) => {
      assert.ok(err.message.includes("'run' must be a function"));
      return true;
    }
  );

  console.log("All ingestion runner tests passed.");
  console.log("Example pipeline report (from mock run):");
  console.log(JSON.stringify(reportA, null, 2));
}

runTests();
