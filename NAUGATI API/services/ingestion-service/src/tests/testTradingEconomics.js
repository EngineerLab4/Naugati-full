import "dotenv/config";
import { fetchCommodityMarkets } from "../integrations/market/tradingEconomics.service.js";
import { filterNaugatiMarketSignals } from "../integrations/market/normalizer.js";

async function main() {
  const apiKey = process.env.TRADING_ECONOMICS_API_KEY?.trim();

  if (!apiKey) {
    console.error(
      "Market Error: Trading Economics API key is missing. Please set TRADING_ECONOMICS_API_KEY in your environment (.env file)."
    );
    return;
  }

  try {
    const result = await fetchCommodityMarkets();

    console.log("Naugati Market Signals:");
    const filtered = filterNaugatiMarketSignals(result);
    console.log(JSON.stringify(filtered, null, 2));

    console.log(`Total normalized commodities: ${result.market_count}`);
  } catch (error) {
    console.error("Market Error:", error.message);
  }
}

main();
