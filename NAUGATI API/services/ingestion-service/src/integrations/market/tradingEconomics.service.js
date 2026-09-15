import axios from "axios";
import { normalizeTradingEconomicsMarkets } from "./normalizer.js";
import { withProviderHealth } from "../../health/withProviderHealth.js";

function getApiKey() {
  const apiKey = process.env.TRADING_ECONOMICS_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error(
      "Trading Economics API key is missing. Please set TRADING_ECONOMICS_API_KEY in your environment (.env file)."
    );
  }
  return apiKey.trim();
}

function getBaseUrl() {
  return (
    process.env.TRADING_ECONOMICS_BASE_URL ||
    "https://api.tradingeconomics.com"
  ).replace(/\/+$/, "");
}

function handleProviderError(error, contextDescription) {
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    throw new Error(
      `Trading Economics ${contextDescription} request timed out after 15000ms.`
    );
  }

  if (error.response) {
    const status = error.response.status;
    const resData = error.response.data;
    let detail;

    if (typeof resData === "string") {
      detail = resData.slice(0, 200);
    } else {
      detail =
        resData?.message ||
        resData?.error ||
        error.response.statusText ||
        error.message;
    }

    if (status === 400) {
      throw new Error(
        `Trading Economics invalid request (400): ${detail}`
      );
    }
    if (status === 401) {
      throw new Error(
        "Trading Economics authentication failed (401): Missing or invalid API key."
      );
    }
    if (status === 403) {
      throw new Error(
        `Trading Economics permission/limit failure (403): ${detail}`
      );
    }
    if (status === 409) {
      throw new Error(
        `Trading Economics throttling (409): Too many concurrent requests.`
      );
    }
    if (status === 429) {
      throw new Error(
        `Trading Economics rate limit reached (429): ${detail}`
      );
    }

    throw new Error(
      `Trading Economics API error (${status}): ${detail}`
    );
  }

  throw new Error(
    error.message.startsWith("Trading Economics")
      ? error.message
      : `Trading Economics request failed: ${error.message}`
  );
}

export async function fetchCommodityMarkets() {
  return await withProviderHealth("trading-economics", async () => {
    const apiKey = getApiKey();
    const baseUrl = getBaseUrl();
    const endpoint = `${baseUrl}/markets/commodities`;

    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: apiKey,
          Accept: "application/json"
        },
        timeout: 15000
      });

      if (!response.data) {
        throw new Error("Trading Economics returned an empty response.");
      }

      return normalizeTradingEconomicsMarkets(response.data);
    } catch (error) {
      handleProviderError(error, "commodity markets");
    }
  });
}

export async function fetchMarketSymbol(symbol) {
  if (typeof symbol !== "string" || !symbol.trim()) {
    throw new Error("Invalid input: 'symbol' must be a non-empty string.");
  }

  return await withProviderHealth("trading-economics", async () => {
    const apiKey = getApiKey();
    const baseUrl = getBaseUrl();
    const encodedSymbol = encodeURIComponent(symbol.trim());
    const endpoint = `${baseUrl}/markets/symbol/${encodedSymbol}`;

    try {
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: apiKey,
          Accept: "application/json"
        },
        timeout: 15000
      });

      if (!response.data) {
        throw new Error("Trading Economics returned an empty response.");
      }

      return normalizeTradingEconomicsMarkets(response.data);
    } catch (error) {
      handleProviderError(error, `symbol (${symbol.trim()})`);
    }
  });
}
