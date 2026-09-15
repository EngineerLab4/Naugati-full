import "dotenv/config";
import { fetchVesselPosition } from "../integrations/ais/vesselFinder.service.js";

async function main() {
  const apiKey = process.env.VESSELFINDER_API_KEY?.trim();
  const testImo = process.env.VESSELFINDER_TEST_IMO?.trim();

  if (!apiKey) {
    console.error(
      "AIS Error: VesselFinder API key is missing. Please set VESSELFINDER_API_KEY in your environment (.env file)."
    );
    return;
  }

  if (!testImo) {
    console.warn(
      "VESSELFINDER_TEST_IMO is not configured. Add a valid test IMO locally before making a live AIS request."
    );
    return;
  }

  try {
    const vessel = await fetchVesselPosition({
      imo: Number(testImo)
    });

    console.log("Naugati AIS Vessel Position:");
    console.log(JSON.stringify(vessel, null, 2));
  } catch (error) {
    console.error("AIS Error:", error.message);
  }
}

main();
