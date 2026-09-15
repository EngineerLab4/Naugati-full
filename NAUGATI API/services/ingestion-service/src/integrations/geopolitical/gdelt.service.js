import axios from "axios";
import { normalizeGdeltArticles } from "./normalizer.js";
import { withProviderHealth } from "../../health/withProviderHealth.js";

export async function fetchGeopoliticalSignals({
  query,
  timespan = "24h",
  maxRecords = 25
} = {}) {
  if (typeof query !== "string" || !query.trim()) {
    throw new Error("Invalid input: 'query' must be a non-empty string.");
  }

  if (typeof timespan !== "string" || !timespan.trim()) {
    throw new Error("Invalid input: 'timespan' must be a non-empty string.");
  }

  const parsedMaxRecords = Number(maxRecords);
  if (
    !Number.isInteger(parsedMaxRecords) ||
    parsedMaxRecords <= 0
  ) {
    throw new Error(
      "Invalid input: 'maxRecords' must be a positive integer."
    );
  }

  const clampedMaxRecords = Math.min(parsedMaxRecords, 250);

  return await withProviderHealth("gdelt", async () => {
    const baseUrl =
      process.env.GDELT_BASE_URL ||
      "https://api.gdeltproject.org/api/v2/doc/doc";

    try {
      const response = await axios.get(baseUrl, {
        params: {
          query: query.trim(),
          mode: "artlist",
          format: "json",
          timespan: timespan.trim(),
          maxrecords: clampedMaxRecords,
          sort: "datedesc"
        },
        timeout: 15000,
        headers: {
          Accept: "application/json",
          "User-Agent": "NAUGATI-Ingestion-Service/0.1"
        }
      });

      let data = response.data;

      // GDELT occasionally returns text/html or string-encoded JSON
      if (typeof data === "string") {
        const trimmed = data.trim();
        if (
          !trimmed ||
          trimmed.toLowerCase().includes("no articles found") ||
          trimmed.toLowerCase().includes("your query did not match")
        ) {
          data = { articles: [] };
        } else {
          try {
            data = JSON.parse(trimmed);
          } catch {
            if (trimmed.startsWith("<") || trimmed.includes("<html")) {
              throw new Error(
                "GDELT returned an unexpected HTML response instead of JSON data."
              );
            }
            throw new Error(`GDELT returned a malformed response: ${trimmed}`);
          }
        }
      }

      if (!data || typeof data !== "object") {
        throw new Error("GDELT returned an invalid response structure.");
      }

      return normalizeGdeltArticles(data, {
        query: query.trim(),
        timespan: timespan.trim()
      });
    } catch (error) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("GDELT request timed out after 15000ms.");
      }

      if (error.response) {
        const status = error.response.status;

        if (status === 429) {
          const retryAfter =
            error.response.headers?.["retry-after"] ||
            error.response.headers?.["Retry-After"];
          const retryMsg = retryAfter
            ? ` (provider Retry-After: ${retryAfter})`
            : "";
          const rateLimitError = new Error(
            `GDELT rate limit reached. Wait before making another request.${retryMsg}`
          );
          if (retryAfter != null) {
            rateLimitError.retryAfter = retryAfter;
          }
          throw rateLimitError;
        }

        const resData = error.response.data;
        let errorMsg;

        if (typeof resData === "string") {
          errorMsg = resData.slice(0, 300); // Prevent massive HTML dumps in error message
        } else {
          errorMsg =
            resData?.message ||
            resData?.error ||
            error.response.statusText ||
            error.message;
        }

        throw new Error(`GDELT API error (${status}): ${errorMsg}`);
      }

      throw new Error(
        error.message.startsWith("GDELT")
          ? error.message
          : `GDELT request failed: ${error.message}`
      );
    }
  });
}
