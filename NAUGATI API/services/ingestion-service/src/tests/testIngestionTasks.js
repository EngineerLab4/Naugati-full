import assert from "node:assert";
import "dotenv/config";
import {
  createOpenMeteoIngestionTask,
  createConfiguredIngestionTasks
} from "../tasks/ingestionTasks.js";
import { INGESTION_SCHEDULES } from "../scheduler/scheduleConfig.js";

async function runTests() {
  // ==================================================
  // TEST A — TASK CREATION
  // ==================================================
  const taskA = createOpenMeteoIngestionTask({
    latitude: 20.316,
    longitude: 86.611
  });

  assert.strictEqual(taskA.name, "open-meteo");
  assert.strictEqual(taskA.enabled, INGESTION_SCHEDULES["open-meteo"].enabled);
  assert.strictEqual(
    taskA.interval_ms,
    INGESTION_SCHEDULES["open-meteo"].interval_ms
  );
  assert.strictEqual(typeof taskA.run, "function");

  // ==================================================
  // TEST B — INVALID CONFIG
  // ==================================================
  assert.throws(
    () =>
      createOpenMeteoIngestionTask({
        latitude: 200,
        longitude: 86.611
      }),
    (err) => {
      assert.ok(err.message.includes("Invalid latitude"));
      return true;
    }
  );

  assert.throws(
    () =>
      createOpenMeteoIngestionTask({
        latitude: 20.316,
        longitude: 500
      }),
    (err) => {
      assert.ok(err.message.includes("Invalid longitude"));
      return true;
    }
  );

  assert.throws(
    () =>
      createOpenMeteoIngestionTask({
        longitude: 86.611
      }),
    (err) => {
      assert.ok(err.message.includes("missing latitude"));
      return true;
    }
  );

  assert.throws(
    () =>
      createOpenMeteoIngestionTask({
        latitude: 20.316
      }),
    (err) => {
      assert.ok(err.message.includes("missing longitude"));
      return true;
    }
  );

  // ==================================================
  // TEST C — CONFIGURED TASK LIST
  // ==================================================
  const tasksWithWeather = createConfiguredIngestionTasks({
    weather: {
      latitude: 20.316,
      longitude: 86.611
    }
  });

  assert.strictEqual(tasksWithWeather.length, 1);
  assert.strictEqual(tasksWithWeather[0].name, "open-meteo");
  assert.strictEqual(
    tasksWithWeather[0].enabled,
    INGESTION_SCHEDULES["open-meteo"].enabled
  );
  assert.strictEqual(
    tasksWithWeather[0].interval_ms,
    INGESTION_SCHEDULES["open-meteo"].interval_ms
  );

  const tasksWithoutWeather = createConfiguredIngestionTasks({});
  assert.strictEqual(tasksWithoutWeather.length, 0);

  // ==================================================
  // TEST D — OPTIONAL LIVE TASK TEST
  // ==================================================
  if (process.env.RUN_OPEN_METEO_TASK_LIVE_TEST === "true") {
    const liveResult = await taskA.run();
    assert.strictEqual(liveResult.provider, "open-meteo");
    console.log("Open-Meteo task live test passed.");
  } else {
    console.log("Open-Meteo task live test skipped.");
  }

  console.log("All ingestion tasks tests passed.");
  console.log("Example configured task object:");
  console.log(
    JSON.stringify(
      {
        name: taskA.name,
        enabled: taskA.enabled,
        interval_ms: taskA.interval_ms,
        run: "[AsyncFunction: run]"
      },
      null,
      2
    )
  );
}

runTests();
