import { fetchMarineWeather } from "../integrations/weather/openMeteo.service.js";
import { INGESTION_SCHEDULES } from "../scheduler/scheduleConfig.js";

function isValidLatitude(lat) {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90
  );
}

function isValidLongitude(lon) {
  return (
    typeof lon === "number" &&
    Number.isFinite(lon) &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Creates an ingestion task configuration for Open-Meteo marine weather.
 *
 * @param {Object} options
 * @param {number} options.latitude
 * @param {number} options.longitude
 * @returns {Object} Ingestion task object.
 */
export function createOpenMeteoIngestionTask(options) {
  if (!options || typeof options !== "object") {
    throw new Error(
      "Invalid input: options must be an object with latitude and longitude."
    );
  }

  const { latitude, longitude } = options;

  if (latitude === undefined || latitude === null) {
    throw new Error("Invalid input: missing latitude.");
  }
  if (!isValidLatitude(latitude)) {
    throw new Error(
      `Invalid latitude: ${latitude}. Must be a finite number between -90 and 90.`
    );
  }

  if (longitude === undefined || longitude === null) {
    throw new Error("Invalid input: missing longitude.");
  }
  if (!isValidLongitude(longitude)) {
    throw new Error(
      `Invalid longitude: ${longitude}. Must be a finite number between -180 and 180.`
    );
  }

  return {
    name: "open-meteo",
    enabled: INGESTION_SCHEDULES["open-meteo"].enabled,
    interval_ms: INGESTION_SCHEDULES["open-meteo"].interval_ms,
    run: async () => {
      return fetchMarineWeather({
        latitude,
        longitude
      });
    }
  };
}

/**
 * Creates an array of configured ingestion tasks based on provided configuration.
 *
 * @param {Object} [config={}]
 * @param {Object} [config.weather]
 * @returns {Array<Object>} Array of runnable ingestion task objects.
 */
export function createConfiguredIngestionTasks(config = {}) {
  const tasks = [];

  if (config && typeof config === "object" && config.weather) {
    tasks.push(createOpenMeteoIngestionTask(config.weather));
  }

  return tasks;
}
