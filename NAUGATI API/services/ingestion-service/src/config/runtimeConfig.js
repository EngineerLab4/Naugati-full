function parseBoolean(val, varName, defaultValue = false) {
  if (
    val === undefined ||
    val === null ||
    (typeof val === "string" && val.trim() === "")
  ) {
    return defaultValue;
  }

  if (typeof val === "boolean") {
    return val;
  }

  if (typeof val === "string") {
    const normalized = val.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  throw new Error(
    `Invalid boolean value for ${varName}: '${val}'. Must be 'true' or 'false'.`
  );
}

function isValidCoordinate(lat, lon) {
  return (
    typeof lat === "number" &&
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lon === "number" &&
    Number.isFinite(lon) &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Loads and validates runtime configuration from environment variables.
 *
 * @param {Object} [env=process.env]
 * @returns {Object} Validated runtime configuration.
 */
export function loadRuntimeConfig(env = process.env) {
  const schedulerEnabled = parseBoolean(
    env.INGESTION_SCHEDULER_ENABLED,
    "INGESTION_SCHEDULER_ENABLED",
    false
  );

  const runOnStart = parseBoolean(
    env.INGESTION_RUN_ON_START,
    "INGESTION_RUN_ON_START",
    false
  );

  const rawLat = env.OPEN_METEO_LATITUDE;
  const rawLon = env.OPEN_METEO_LONGITUDE;

  const hasLat =
    rawLat !== undefined && rawLat !== null && String(rawLat).trim() !== "";
  const hasLon =
    rawLon !== undefined && rawLon !== null && String(rawLon).trim() !== "";

  let weather = null;

  if (hasLat && !hasLon) {
    throw new Error(
      "Invalid configuration: OPEN_METEO_LATITUDE was provided without OPEN_METEO_LONGITUDE."
    );
  }

  if (!hasLat && hasLon) {
    throw new Error(
      "Invalid configuration: OPEN_METEO_LONGITUDE was provided without OPEN_METEO_LATITUDE."
    );
  }

  if (hasLat && hasLon) {
    const lat = Number(rawLat);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      throw new Error(
        `Invalid latitude for OPEN_METEO_LATITUDE: '${rawLat}'. Must be a finite number between -90 and 90.`
      );
    }

    const lon = Number(rawLon);
    if (!Number.isFinite(lon) || lon < -180 || lon > 180) {
      throw new Error(
        `Invalid longitude for OPEN_METEO_LONGITUDE: '${rawLon}'. Must be a finite number between -180 and 180.`
      );
    }

    weather = {
      latitude: lat,
      longitude: lon
    };
  }

  return {
    schedulerEnabled,
    runOnStart,
    ingestion: {
      weather
    }
  };
}
