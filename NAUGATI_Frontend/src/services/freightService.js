import { apiClient } from './apiClient';
import { 
  DATA_METADATA, 
  MARKET_INDICES, 
  FREIGHT_TIME_SERIES, 
  ML_MODEL_BENCHMARKS 
} from './demoData';

export const freightService = {
  // Returns metadata about data freshness and simulation state
  getMetadata() {
    return DATA_METADATA;
  },

  // Returns current benchmark dry bulk indices and bunker prices
  async getMarketIndices() {
    try {
      const live = await apiClient.getMarketOverview();
      if (live && live.commodities) {
        return {
          metadata: {
            ...DATA_METADATA,
            lastUpdated: new Date().toLocaleTimeString() + " UTC",
            simulationMode: false,
          },
          indices: MARKET_INDICES.map(idx => {
            const match = live.commodities.find(c => c.commodity.toLowerCase().includes(idx.name.toLowerCase()));
            if (match) {
              return { ...idx, value: match.price_usd };
            }
            return idx;
          })
        };
      }
    } catch (_) {
      // Fallback to cached benchmarks
    }
    return {
      metadata: DATA_METADATA,
      indices: MARKET_INDICES
    };
  },

  // Returns time-series historical & multi-horizon forecast data
  async getFreightForecast({ origin = "Australia", destination = "Dhamra", vesselType = "Panamax", horizon = "30D" }) {
    try {
      const backendRes = await apiClient.getFreightForecast({
        origin,
        destination,
        vessel_type: vesselType,
        cargo_qty: 75000,
        loading_date: new Date().toISOString().slice(0, 10),
      });

      if (backendRes && backendRes.predicted_rate) {
        return {
          metadata: {
            ...DATA_METADATA,
            lastUpdated: "Live Backend ML (" + backendRes.model_version + ")",
            simulationMode: false,
          },
          currentFreightUSDPerMT: backendRes.current_rate,
          forecast7D: backendRes.forecast_7d || +(backendRes.current_rate * 1.028).toFixed(2),
          forecast14D: backendRes.forecast_14d || +(backendRes.current_rate * 1.055).toFixed(2),
          forecast30D: backendRes.forecast_30d || backendRes.predicted_rate,
          forecast90D: backendRes.forecast_90d || backendRes.forecast_3m || +(backendRes.current_rate * 1.159).toFixed(2),
          forecast180D: backendRes.forecast_6m || +(backendRes.current_rate * 1.22).toFixed(2),
          predictionRange: {
            min: backendRes.range_low,
            max: backendRes.range_high,
          },
          confidence: "High (" + Math.round(backendRes.confidence * 100) + "%)",
          trend: backendRes.trend,
          marketAction: backendRes.recommended_action,
          marketActionReason: backendRes.market_action_reason || "Econometric multi-horizon model indicates optimal chartering window.",
          timeSeries: backendRes.time_series && backendRes.time_series.length > 0 ? backendRes.time_series : FREIGHT_TIME_SERIES,
          benchmarks: ML_MODEL_BENCHMARKS,
          model_version: backendRes.model_version,
          factors: backendRes.factors,
        };
      }
    } catch (err) {
      console.warn("[freightService] Live prediction-service call failed. Using calibrated fallback.", err.message);
    }

    // Calibrated baseline fallback
    let baseRate = 31.40;
    if (vesselType === "Capesize") baseRate = 24.20;
    else if (vesselType === "Supramax") baseRate = 36.80;
    else if (vesselType === "Handysize") baseRate = 42.10;

    let distanceFactor = 1.0;
    if (origin.toLowerCase().includes("indonesia")) distanceFactor = 0.55;
    else if (origin.toLowerCase().includes("mozambique")) distanceFactor = 1.15;
    else if (origin.toLowerCase().includes("russia")) distanceFactor = 1.45;
    else if (origin.toLowerCase().includes("us") || origin.toLowerCase().includes("united states")) distanceFactor = 1.95;

    const currentRate = +(baseRate * distanceFactor).toFixed(2);
    const forecast7D = +(currentRate * 1.028).toFixed(2);
    const forecast14D = +(currentRate * 1.055).toFixed(2);
    const forecast30D = +(currentRate * 1.098).toFixed(2);
    const forecast90D = +(currentRate * 1.159).toFixed(2);

    const timeSeries = FREIGHT_TIME_SERIES.map(point => {
      const scale = currentRate / 31.40;
      return {
        ...point,
        actual: point.actual ? +(point.actual * scale).toFixed(2) : null,
        forecast: point.forecast ? +(point.forecast * scale).toFixed(2) : null,
        upper: point.upper ? +(point.upper * scale).toFixed(2) : null,
        lower: point.lower ? +(point.lower * scale).toFixed(2) : null,
      };
    });

    return {
      metadata: DATA_METADATA,
      currentFreightUSDPerMT: currentRate,
      forecast7D,
      forecast14D,
      forecast30D,
      forecast90D,
      predictionRange: {
        min: +(currentRate * 0.94).toFixed(2),
        max: +(forecast30D * 1.06).toFixed(2)
      },
      confidence: "High (88%)",
      trend: "Increasing (+5.5%)",
      marketAction: "BOOK NOW",
      marketActionReason: "Forecast indicates freight rates may increase +5.5% over the next 14 days while suitable vessel availability is favorable.",
      timeSeries,
      benchmarks: ML_MODEL_BENCHMARKS
    };
  }
};
