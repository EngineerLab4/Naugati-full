import axios from "axios";
import { normalizeVesselFinderAIS } from "./normalizer.js";
import { withProviderHealth } from "../../health/withProviderHealth.js";

function isValidIMO(imo) {
  if (imo === undefined || imo === null) return false;
  const str = String(imo).trim();
  return /^\d{7}$/.test(str);
}

function isValidMMSI(mmsi) {
  if (mmsi === undefined || mmsi === null) return false;
  const str = String(mmsi).trim();
  return /^\d{9}$/.test(str);
}

export async function fetchVesselPosition({ imo, mmsi } = {}) {
  const hasValidImo = isValidIMO(imo);
  const hasValidMmsi = isValidMMSI(mmsi);

  if (!hasValidImo && !hasValidMmsi) {
    throw new Error(
      "Invalid input: Must provide either a valid 7-digit numeric IMO or a 9-digit numeric MMSI."
    );
  }

  return await withProviderHealth("vesselfinder", async () => {
    const apiKey = process.env.VESSELFINDER_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      throw new Error(
        "VesselFinder API key is missing. Please set VESSELFINDER_API_KEY in your environment (.env file)."
      );
    }

    const baseUrl =
      process.env.VESSELFINDER_BASE_URL ||
      "https://api.vesselfinder.com/vessels";

    const params = {
      userkey: apiKey.trim(),
      format: "json",
      errormode: 409,
      sat: 0
    };

    if (hasValidImo) {
      params.imo = Number(String(imo).trim());
    } else if (hasValidMmsi) {
      params.mmsi = Number(String(mmsi).trim());
    }

    try {
      const response = await axios.get(baseUrl, {
        params,
        timeout: 15000
      });

      const data = response.data;

      // Check if provider returned an error structure in response body
      if (
        data &&
        typeof data === "object" &&
        !Array.isArray(data) &&
        data.error
      ) {
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : data.error.message || JSON.stringify(data.error);
        throw new Error(`VesselFinder API error: ${errorMsg}`);
      }

      // Check for empty vessel results
      if (!data || (Array.isArray(data) && data.length === 0)) {
        throw new Error(
          "VesselFinder returned no vessel data for the specified identifier."
        );
      }

      const normalized = normalizeVesselFinderAIS(data);
      if (!normalized) {
        throw new Error(
          "VesselFinder returned empty or unparseable vessel data."
        );
      }

      return normalized;
    } catch (error) {
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        throw new Error("VesselFinder request timed out after 15000ms.");
      }

      if (error.response) {
        const status = error.response.status;
        if (status === 401 || status === 403) {
          throw new Error(
            `VesselFinder authentication failed (${status}): Invalid or unauthorized userkey.`
          );
        }

        const resData = error.response.data;
        let errorMsg;

        if (typeof resData === "string") {
          errorMsg = resData;
        } else {
          errorMsg =
            resData?.error ??
            resData?.message ??
            error.response.statusText ??
            error.message;
        }

        if (typeof errorMsg === "object") {
          errorMsg = JSON.stringify(errorMsg);
        }

        if (status === 409) {
          throw new Error(`VesselFinder provider error (409): ${errorMsg}`);
        }

        throw new Error(`VesselFinder API error (${status}): ${errorMsg}`);
      }

      // If it is already an explicitly formatted error from above, rethrow
      throw new Error(
        error.message.startsWith("VesselFinder")
          ? error.message
          : `VesselFinder request failed: ${error.message}`
      );
    }
  });
}
