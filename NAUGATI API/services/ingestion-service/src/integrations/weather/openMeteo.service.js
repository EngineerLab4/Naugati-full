import axios from "axios";
import { normalizeOpenMeteoMarine } from "./normalizer.js";
import { withProviderHealth } from "../../health/withProviderHealth.js";

const BASE_URL =
  process.env.OPEN_METEO_BASE_URL ||
  "https://marine-api.open-meteo.com/v1/marine";

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

export async function fetchMarineWeather({ latitude, longitude }) {
  if (!isValidCoordinate(latitude, longitude)) {
    throw new Error(
      "Invalid input: latitude and longitude must be valid geographic coordinates."
    );
  }

  return await withProviderHealth("open-meteo", async () => {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          latitude,
          longitude,
          current: [
            "wave_height",
            "wave_direction",
            "wave_period",
            "swell_wave_height",
            "swell_wave_direction",
            "swell_wave_period",
            "sea_surface_temperature",
            "ocean_current_velocity"
          ].join(",")
        },
        timeout: 10000
      });

      return normalizeOpenMeteoMarine(response.data);
    } catch (error) {
      throw new Error(`Open-Meteo Marine API failed: ${error.message}`);
    }
  });
}
