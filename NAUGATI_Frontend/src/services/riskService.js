import { DATA_METADATA } from './demoData';
import { apiClient } from './apiClient';

export const riskService = {
  getMetadata() {
    return DATA_METADATA;
  },

  async getRiskAssessment({ portId = "dhamra", vesselType = "Panamax", origin = "Australia" }) {
    const riskCategories = [
      {
        category: "Geopolitical & Security",
        level: origin.toLowerCase().includes("russia") ? "High" : "Low",
        status: origin.toLowerCase().includes("russia") ? "critical" : "positive",
        affectedArea: origin.toLowerCase().includes("russia") ? "Black Sea / Bosphorus Choke Point" : "Indo-Pacific Transit",
        potentialImpact: origin.toLowerCase().includes("russia") ? "Sanction screening delays, high war-risk insurance premiums" : "Clear commercial passage; no active conflict zones",
        recommendedAction: origin.toLowerCase().includes("russia") ? "Pre-clear OFAC/EU compliance certificates before charter fixture" : "Standard voyage security watch",
        lastUpdated: "Today, 08:30 UTC"
      },
      {
        category: "Weather & Sea State",
        level: "Low-Medium",
        status: "warning",
        affectedArea: "Bay of Bengal (Southwest Monsoon Tail)",
        potentialImpact: "Wave swells 2.0–2.5m; speed reduction up to 0.6 knots",
        recommendedAction: "Execute weather routing via southern approach waypoint",
        lastUpdated: "1 hour ago"
      },
      {
        category: "Port Berth Congestion",
        level: portId === "paradip" ? "High" : (portId === "haldia" ? "High" : "Medium"),
        status: (portId === "paradip" || portId === "haldia") ? "critical" : "warning",
        affectedArea: `${portId.toUpperCase()} Mechanised Terminal`,
        potentialImpact: portId === "paradip" ? "3.4 days average waiting at anchorage" : "1.8 days average waiting",
        recommendedAction: (portId === "paradip" || portId === "haldia") ? "Divert or lighter part cargo at Sandheads, or substitute with Dhamra Port" : "Maintain scheduled pilot notice",
        lastUpdated: "20 mins ago"
      },
      {
        category: "Fuel & Bunker Volatility",
        level: "Low",
        status: "positive",
        affectedArea: "Singapore & Colombo Bunkering Hubs",
        potentialImpact: "VLSFO prices declining -0.8% ($624/MT); bunker expense stable",
        recommendedAction: "Bunker at Singapore or Colombo anchorage prior to Bay of Bengal entry",
        lastUpdated: "4 hours ago"
      },
      {
        category: "Trade & Sanction Compliance",
        level: "Low",
        status: "positive",
        affectedArea: "India East Coast Customs",
        potentialImpact: "Zero restrictions on Australian thermal/coking coal imports",
        recommendedAction: "Submit pre-arrival import declarations via ICEGATE portal",
        lastUpdated: "Yesterday"
      }
    ];

    // Calculate Idle-Time Risk (Section 34 of user spec)
    const waitingDays = portId === "paradip" ? 3.4 : (portId === "haldia" ? 4.2 : 1.8);
    const dailyCharterRate = vesselType === "Capesize" ? 26500 : (vesselType === "Panamax" ? 16800 : 12500);
    const potentialIdleCostUSD = Math.round(waitingDays * dailyCharterRate);

    let idleRiskLevel = "Low";
    if (waitingDays > 3.0) idleRiskLevel = "High";
    else if (waitingDays > 1.5) idleRiskLevel = "Medium";

    const idleTimeRisk = {
      level: idleRiskLevel,
      status: idleRiskLevel === "High" ? "critical" : (idleRiskLevel === "Medium" ? "warning" : "positive"),
      expectedIdleDays: waitingDays,
      dailyDemurrageCostUSD: dailyCharterRate,
      potentialIdleCostUSD,
      whyReason: `Idle time is driven by anchorage congestion at the discharge port (${waitingDays} days waiting). Berthing queues for mechanized bulk unloaders are running at elevated capacity.`
    };

    return {
      metadata: DATA_METADATA,
      overallRiskScore: portId === "paradip" ? 68 : 34,
      overallRiskVerdict: portId === "paradip" ? "Medium-High Risk" : "Low-Medium Risk",
      riskCategories,
      idleTimeRisk
    };
  },

  async getLiveWeatherRiskAssessment({ location = "Bay of Bengal (Central Corridor)", vesselType = "Panamax", lat = 13.85, lon = 85.98 }) {
    try {
      const live = await apiClient.getWeatherRisk({
        corridor_or_port: location,
        latitude: lat,
        longitude: lon,
        vessel_class: vesselType,
      });
      if (live && live.risk_level) {
        return live;
      }
    } catch (err) {
      console.error("[riskService] Live weather risk assessment failed:", err.message);
      throw new Error(`Weather risk assessment service unavailable: ${err.message}`);
    }
  }
};

