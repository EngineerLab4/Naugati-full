import { createConfiguredIngestionTasks } from "../tasks/ingestionTasks.js";
import { createIngestionScheduler } from "../scheduler/ingestionScheduler.js";

/**
 * Creates the NAUGATI ingestion runtime combining tasks, scheduler, and lifecycle controls.
 *
 * @param {Object} config
 * @param {boolean} config.schedulerEnabled
 * @param {boolean} config.runOnStart
 * @param {Object} config.ingestion
 * @returns {Object} Runtime instance.
 */
export function createIngestionRuntime(config = {}) {
  const tasks = createConfiguredIngestionTasks(config.ingestion);
  const scheduler = createIngestionScheduler(tasks);

  async function start() {
    const schedulerEnabled = Boolean(config.schedulerEnabled);
    const runOnStart = Boolean(config.runOnStart);

    if (!schedulerEnabled) {
      return {
        started: false,
        scheduler_enabled: false,
        message: "Ingestion scheduler is disabled by configuration.",
        initial_runs: []
      };
    }

    const initialRuns = [];

    if (runOnStart) {
      for (const task of tasks) {
        if (task.enabled) {
          try {
            const report = await scheduler.runNow(task.name);
            initialRuns.push({
              task: task.name,
              report
            });
          } catch (err) {
            initialRuns.push({
              task: task.name,
              error: err?.message || String(err)
            });
          }
        }
      }
    }

    scheduler.start();

    return {
      started: true,
      scheduler_enabled: true,
      message: "Ingestion scheduler started.",
      initial_runs: initialRuns
    };
  }

  function stop() {
    scheduler.stop();
  }

  function status() {
    return {
      scheduler_enabled: Boolean(config.schedulerEnabled),
      configured_task_count: tasks.length,
      configured_tasks: tasks.map((t) => t.name),
      scheduler: scheduler.getSchedulerStatus()
    };
  }

  return {
    tasks,
    scheduler,
    start,
    stop,
    status
  };
}
