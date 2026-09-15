import "dotenv/config";
import { fetchGeopoliticalSignals } from "../integrations/geopolitical/gdelt.service.js";

async function main() {
  try {
    const result = await fetchGeopoliticalSignals({
      query: '("port closure" OR "shipping disruption" OR "maritime attack")',
      timespan: "24h",
      maxRecords: 10
    });

    console.log("Naugati Geopolitical Signals:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("GDELT Error:", error.message);
  }
}

main();
