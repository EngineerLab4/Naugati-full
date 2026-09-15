// NAUGATI Maritime Intelligence — Risk Layer Service
// Provides real-time and simulated risk intelligence layers for interactive mapping and route scoring.

export const RISK_ZONES = [
  {
    id: "risk-weather-bob",
    name: "Bay of Bengal Swell & Cyclone Watch",
    category: "Weather Risk",
    severity: "Medium",
    color: "#f59e0b",
    fillColor: "rgba(245, 158, 11, 0.22)",
    coordinates: [15.2, 87.8], // [lat, lng]
    radiusKm: 320,
    expectedImpact: "Possible 4–8 hour voyage delay; swell heights 2.2m–2.8m",
    reason: "Strong southwest monsoon winds and localized depression expected along this corridor.",
    affectedSegment: "Bay of Bengal Approach to Dhamra & Paradip",
    lastUpdated: "14 Sep 2026, 05:45 IST",
    activeWarnings: ["Sea State 4", "Wind Gusts up to 28 kts", "Reduced bunker efficiency by 4.2%"]
  },
  {
    id: "risk-congestion-malacca",
    name: "Malacca Strait & Singapore TSS Congestion",
    category: "Port & Strait Congestion",
    severity: "High",
    color: "#ef4444",
    fillColor: "rgba(239, 68, 68, 0.24)",
    coordinates: [2.5, 101.8],
    radiusKm: 260,
    expectedImpact: "Vessel transit congestion; speed restriction 10 knots in Traffic Separation Scheme",
    reason: "High traffic density exceeding 220 commercial vessels/day and bunkering queues at Singapore Eastern Anchorage.",
    affectedSegment: "Strait of Malacca North Gate to Singapore West Gateway",
    lastUpdated: "14 Sep 2026, 06:00 IST",
    activeWarnings: ["Mandatory TSS reporting", "Anchorage wait >14 hours for non-priority bunkering"]
  },
  {
    id: "risk-congestion-paradip",
    name: "Paradip & Sandheads Anchorage Queue",
    category: "Port Congestion",
    severity: "High",
    color: "#ef4444",
    fillColor: "rgba(239, 68, 68, 0.22)",
    coordinates: [20.26, 86.67],
    radiusKm: 110,
    expectedImpact: "3.4 days average waiting time at outer roads before mechanized berth",
    reason: "11 bulk vessels waiting in queue; heavy coal discharge demand from thermal power utilities.",
    affectedSegment: "Paradip Outer Roads & Anchorage Alpha",
    lastUpdated: "14 Sep 2026, 06:10 IST",
    activeWarnings: ["Queue: 11 Capesize/Panamax vessels", "Berth occupancy 94%"]
  },
  {
    id: "risk-nav-torres",
    name: "Torres Strait & Prince of Wales Channel Draft Restriction",
    category: "Navigation Risk",
    severity: "Medium",
    color: "#f59e0b",
    fillColor: "rgba(245, 158, 11, 0.20)",
    coordinates: [-10.5, 142.2],
    radiusKm: 160,
    expectedImpact: "Mandatory coastal pilotage required; max permissible draft 12.2m at low water",
    reason: "Shallow coral reef channels and tidal draft restrictions. Fully laden Capesize must take outer deep-water route.",
    affectedSegment: "Torres Strait East-West Transit Corridor",
    lastUpdated: "14 Sep 2026, 04:30 IST",
    activeWarnings: ["Draft limitation: 12.2m without UKC clearance", "Speed restricted to 12 knots"]
  },
  {
    id: "risk-geopolitical-andaman",
    name: "Andaman & Nicobar Security Patrol Corridor",
    category: "Geopolitical Risk",
    severity: "Low",
    color: "#10b981",
    fillColor: "rgba(16, 185, 129, 0.18)",
    coordinates: [7.8, 93.7],
    radiusKm: 200,
    expectedImpact: "Routine maritime patrol checks; standard AIS transmission compliance required",
    reason: "Active naval surveillance and economic exclusion zone security watch.",
    affectedSegment: "Six Degree Channel entrance into Bay of Bengal",
    lastUpdated: "14 Sep 2026, 05:00 IST",
    activeWarnings: ["Standard AIS broadcast mandatory", "Normal peaceful transit confirmed"]
  }
];

export const maritimeRiskService = {
  getAllRiskZones() {
    return RISK_ZONES;
  },

  getRiskZoneById(id) {
    return RISK_ZONES.find(z => z.id === id) || null;
  }
};
