import { runIngestionPipeline } from "../runner/ingestionRunner.js";

/**
 * Creates a lightweight ingestion scheduler for recurring tasks.
 *
 * @param {Array<{ name: string, run: () => Promise<any>, interval_ms: number, enabled: boolean }>} tasks
 * @param {Object} [options]
 * @returns {Object} Scheduler instance with start, stop, runNow, and getSchedulerStatus methods.
 */
export function createIngestionScheduler(tasks, options = {}) {
  if (!Array.isArray(tasks)) {
    throw new Error("Invalid input: 'tasks' must be an array.");
  }

  const normalizedTasks = [];
  const taskMap = new Map();
  const taskStates = new Map();

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task || typeof task !== "object") {
      throw new Error(`Invalid task at index ${i}: task must be an object.`);
    }
    if (typeof task.name !== "string" || !task.name.trim()) {
      throw new Error(
        `Invalid task at index ${i}: 'name' must be a non-empty string.`
      );
    }
    if (typeof task.run !== "function") {
      throw new Error(
        `Invalid task at index ${i} ('${task.name}'): 'run' must be a function.`
      );
    }
    if (
      typeof task.interval_ms !== "number" ||
      !Number.isFinite(task.interval_ms) ||
      task.interval_ms <= 0
    ) {
      throw new Error(
        `Invalid task at index ${i} ('${task.name}'): 'interval_ms' must be a positive finite number.`
      );
    }
    if (typeof task.enabled !== "boolean") {
      throw new Error(
        `Invalid task at index ${i} ('${task.name}'): 'enabled' must be a boolean.`
      );
    }

    const trimmedName = task.name.trim();
    if (taskMap.has(trimmedName)) {
      throw new Error(
        `Invalid tasks configuration: duplicate task name '${trimmedName}'.`
      );
    }

    const normalizedTask = {
      name: trimmedName,
      run: task.run,
      interval_ms: task.interval_ms,
      enabled: task.enabled
    };

    normalizedTasks.push(normalizedTask);
    taskMap.set(trimmedName, normalizedTask);
    taskStates.set(trimmedName, {
      name: trimmedName,
      enabled: normalizedTask.enabled,
      interval_ms: normalizedTask.interval_ms,
      currently_running: false,
      last_started_at: null,
      last_completed_at: null,
      last_success: null,
      last_error: null,
      skipped_due_to_overlap: 0,
      last_result: null
    });
  }

  let isRunning = false;
  const timers = new Map();

  async function executeTask(task) {
    const state = taskStates.get(task.name);

    if (state.currently_running) {
      state.skipped_due_to_overlap += 1;
      return null;
    }

    state.currently_running = true;
    state.last_started_at = new Date().toISOString();

    let pipelineReport = null;

    try {
      pipelineReport = await runIngestionPipeline([
        {
          name: task.name,
          run: task.run
        }
      ]);

      state.last_completed_at = new Date().toISOString();
      state.last_result = pipelineReport;

      const taskResult = pipelineReport?.results?.[0];
      if (taskResult) {
        state.last_success = taskResult.success;
        state.last_error = taskResult.error;
      } else {
        state.last_success = false;
        state.last_error = "No task result returned by pipeline.";
      }
    } catch (err) {
      state.last_completed_at = new Date().toISOString();
      state.last_success = false;
      state.last_error =
        typeof err === "string"
          ? err
          : err?.message || (err ? String(err) : "Scheduler execution error");
      state.last_result = null;
    } finally {
      state.currently_running = false;
    }

    return pipelineReport;
  }

  function scheduleNext(task) {
    if (!isRunning || !task.enabled) {
      return;
    }

    if (timers.has(task.name)) {
      clearTimeout(timers.get(task.name));
      timers.delete(task.name);
    }

    const timer = setTimeout(async () => {
      timers.delete(task.name);
      if (!isRunning || !task.enabled) {
        return;
      }

      await executeTask(task);

      if (isRunning && task.enabled) {
        scheduleNext(task);
      }
    }, task.interval_ms);

    timers.set(task.name, timer);
  }

  function start() {
    if (isRunning) {
      return; // Do not duplicate timers if already running
    }
    isRunning = true;

    for (const task of normalizedTasks) {
      if (task.enabled) {
        scheduleNext(task);
      }
    }
  }

  function stop() {
    isRunning = false;
    for (const timer of timers.values()) {
      clearTimeout(timer);
    }
    timers.clear();
  }

  async function runNow(taskName) {
    if (typeof taskName !== "string" || !taskName.trim()) {
      throw new Error("Invalid input: 'taskName' must be a non-empty string.");
    }
    const name = taskName.trim();
    const task = taskMap.get(name);
    if (!task) {
      throw new Error(`Task '${name}' not found in scheduler.`);
    }

    return await executeTask(task);
  }

  function getSchedulerStatus() {
    return {
      running: isRunning,
      generated_at: new Date().toISOString(),
      tasks: normalizedTasks.map((t) => {
        const state = taskStates.get(t.name);
        return {
          name: state.name,
          enabled: state.enabled,
          interval_ms: state.interval_ms,
          currently_running: state.currently_running,
          last_started_at: state.last_started_at,
          last_completed_at: state.last_completed_at,
          last_success: state.last_success,
          last_error: state.last_error,
          skipped_due_to_overlap: state.skipped_due_to_overlap
        };
      })
    };
  }

  return {
    start,
    stop,
    runNow,
    getSchedulerStatus
  };
}
