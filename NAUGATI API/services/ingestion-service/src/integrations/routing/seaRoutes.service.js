import axios from "axios";
import { normalizeSeaRoutesRoute } from "./normalizer.js";
import { withProviderHealth } from "../../health/withProviderHealth.js";

function isValidCoordinate(lat, lon) {
  return (
    typeof lat === "number" &&
    !Number.isNaN(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    typeof lon === "number" &&
    !Number.isNaN(lon) &&
    lon >= -180 &&
    lon <= 180
  );
}

export async function fetchMaritimeRoute({ origin, destination } = {}) {
  if (
    !origin ||
    !destination ||
    !isValidCoordinate(origin.latitude, origin.longitude) ||
    !isValidCoordinate(destination.latitude, destination.longitude)
  ) {
    throw new Error(
      "Invalid input: 'origin' and 'destination' must each contain valid 'latitude' (-90 to 90) and 'longitude' (-180 to 180) numbers."
    );
  }

  return await withProviderHealth("searoutes", async () => {
    const apiKey = process.env.SEAROUTES_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      throw new Error(
        "SeaRoutes API key is missing. Please set SEAROUTES_API_KEY in your environment (.env file)."
      );
    }

    let baseUrl = (
      process.env.SEAROUTES_BASE_URL ||
      "https://api.searoutes.com/route/v2/sea"
    ).replace(/\/+$/, "");

    if (!baseUrl.includes("/route/v2/sea") && !baseUrl.includes("/route")) {
      baseUrl = `${baseUrl}/route/v2/sea`;
    }

    // SeaRoutes format: {originLongitude},{originLatitude};{destinationLongitude},{destinationLatitude}
    const endpoint = `${baseUrl}/${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

    try {
      const response = await axios.get(endpoint, {
        headers: {
          "x-api-key": apiKey.trim(),
          Accept: "application/json"
        },
        timeout: 15000
      });

      return normalizeSeaRoutesRoute(response.data, { origin, destination });
    } catch (error) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("SeaRoutes request timed out after 15000ms.");
      }

      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          throw new Error(
            `SeaRoutes authentication failed (${status}): Invalid or unauthorized SEAROUTES_API_KEY.`
          );
        }
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          error.response.statusText ||
          error.message;
        throw new Error(`SeaRoutes API error (${status}): ${message}`);
      }

      throw new Error(`SeaRoutes request failed: ${error.message}`);
    }
  });
}
