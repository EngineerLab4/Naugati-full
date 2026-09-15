import { getProviderHealthSummary } from "../health/providerHealthSummary.js";

/**
 * Executes an array of ingestion tasks sequentially in a controlled pipeline.
 *
 * @param {Array<{ name: string, run: () => Promise<any> }>} tasks
 * @param {Object} [options]
 * @param {boolean} [options.continueOnError=true]
 * @returns {Promise<Object>} Execution report with totals, results, and provider health.
 */
export async function runIngestionPipeline(tasks, options = {}) {
  if (!Array.isArray(tasks)) {
    throw new Error("Invalid input: 'tasks' must be an array.");
  }

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    if (!task || typeof task !== "object") {
      throw new Error(`Invalid task at index ${i}: task must be an object.`);
    }
    if (typeof task.name !== "string" || !task.name.trim()) {
      throw new Error(
        `Invalid task at index ${i}: task 'name' must be a non-empty string.`
      );
    }
    if (typeof task.run !== "function") {
      throw new Error(
        `Invalid task at index ${i} ('${task.name}'): task 'run' must be a function.`
      );
    }
  }

  const continueOnError = options.continueOnError !== false;

  const pipelineStart = Date.now();
  const started_at = new Date(pipelineStart).toISOString();

  const results = [];
  let succeeded = 0;
  let failed = 0;

  for (const task of tasks) {
    const taskStart = Date.now();
    const task_started_at = new Date(taskStart).toISOString();

    try {
      const data = await task.run();
      const taskEnd = Date.now();

      results.push({
        name: task.name.trim(),
        success: true,
        started_at: task_started_at,
        completed_at: new Date(taskEnd).toISOString(),
        duration_ms: Math.max(0, taskEnd - taskStart),
        data: data !== undefined ? data : null,
        error: null
      });
      succeeded += 1;
    } catch (err) {
      const taskEnd = Date.now();
      const errorMsg =
        typeof err === "string"
          ? err
          : err?.message || (err ? String(err) : "Unknown task error");

      results.push({
        name: task.name.trim(),
        success: false,
        started_at: task_started_at,
        completed_at: new Date(taskEnd).toISOString(),
        duration_ms: Math.max(0, taskEnd - taskStart),
        data: null,
        error: errorMsg
      });
      failed += 1;

      if (!continueOnError) {
        break;
      }
    }
  }

  const pipelineEnd = Date.now();
  const completed_at = new Date(pipelineEnd).toISOString();

  return {
    started_at,
    completed_at,
    duration_ms: Math.max(0, pipelineEnd - pipelineStart),
    totals: {
      total: results.length,
      succeeded,
      failed
    },
    results,
    provider_health: getProviderHealthSummary()
  };
}
