import { DATA_METADATA } from './demoData';

export const contractService = {
  getMetadata() {
    return DATA_METADATA;
  },

  async recommendContract({
    cargoQuantity = 75000,
    frequency = "Monthly",
    marketTrend = "Rising",
    riskPreference = "Balanced"
  }) {
    // Decision logic based on prompt specifications:
    // High volatility + repeated cargo -> Short/Medium term
    // Stable market + flexible cargo -> Spot
    // Predictable large volume + uncertainty -> Long-term COA

    const contracts = [
      {
        type: "Spot Voyage Charter",
        cost: "$31.40 / MT",
        flexibility: "High",
        risk: "High (Exposed to spot freight inflation)",
        stability: "Low",
        availability: "Immediate",
        score: 72,
        bestFor: "One-off shipments or when freight rates are rapidly declining.",
        recommended: false
      },
      {
        type: "Short-Term Multiple Voyage (3-6 Months)",
        cost: "$30.85 / MT",
        flexibility: "Moderate",
        risk: "Low-Medium (Hedges near-term rate spikes)",
        stability: "High",
        availability: "Guaranteed Laycan Windows",
        score: 94,
        bestFor: "Quarterly repeated cargo when freight rates are trending upward.",
        recommended: true
      },
      {
        type: "Medium-Term Time Charter (6-12 Months)",
        cost: "$16,500 / Day (TCE)",
        flexibility: "High (Operational control)",
        risk: "Medium (Bunker price exposure)",
        stability: "High",
        availability: "Dedicated Vessel",
        score: 85,
        bestFor: "Sustained industrial supply chains with owned terminal control.",
        recommended: false
      },
      {
        type: "Long-Term Contract of Affreightment (COA)",
        cost: "$29.70 / MT Fixed + Bunker Adjustment Factor",
        flexibility: "Low",
        risk: "Low",
        stability: "Maximum",
        availability: "Priority Carrier Schedule",
        score: 80,
        bestFor: "Annual coal volume commitments (>500,000 MT/year).",
        recommended: false
      }
    ];

    let recommendedContract = contracts[1]; // Short-Term Multiple Voyage

    if (riskPreference === "Lowest Cost" && frequency === "One-off") {
      recommendedContract = contracts[0];
      contracts[0].recommended = true;
      contracts[1].recommended = false;
    } else if (frequency === "Annual" || cargoQuantity > 300000) {
      recommendedContract = contracts[3];
      contracts[3].recommended = true;
      contracts[1].recommended = false;
    }

    return {
      metadata: DATA_METADATA,
      contracts,
      recommendedContract,
      strategyReason: `Short-Term Multiple-Voyage Contract is recommended because current freight rates are forecast to increase +5.5% over the next 14–30 days, repeated monthly cargo demand exists, and fixing tonnage now hedges spot market inflation while preserving operational agility.`
    };
  }
};
