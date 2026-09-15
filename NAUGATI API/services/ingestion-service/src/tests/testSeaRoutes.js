import "dotenv/config";
import { fetchMaritimeRoute } from "../integrations/routing/seaRoutes.service.js";

async function main() {
  try {
    const route = await fetchMaritimeRoute({
      origin: {
        latitude: -23.8167,
        longitude: 151.2833
      },
      destination: {
        latitude: 20.316,
        longitude: 86.611
      }
    });

    console.log("Naugati Maritime Route:");
    console.log(JSON.stringify(route, null, 2));
  } catch (error) {
    console.error("Routing Error:", error.message);
  }
}

main();
