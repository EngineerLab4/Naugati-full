// NAUGATI Maritime Intelligence — Live Vessel Tracking & Telemetry Service
// Handles real-time AIS feed simulation, heading calculation, voyage progress, and historical playback.

export const TRACKED_VESSELS = [
  {
    id: "VES-STAR",
    name: "MV Ocean Star",
    imo: "9728415",
    callSign: "V7A3192",
    mmsi: "538009124",
    flag: "Marshall Islands",
    vesselType: "Capesize",
    dwt: 180000,
    draft: 17.8,
    loa: 292.0,
    beam: 45.0,
    cargo: "Coking Coal (165,000 MT)",
    currentPort: "Gladstone, Australia (Departed)",
    originPort: "Gladstone, Australia",
    destinationPort: "Dhamra Port, India",
    destinationPortId: "dhamra",
    nextPort: "Dhamra Port",
    status: "Under Way Using Engine",
    currentPosition: {
      lat: 13.85,
      lng: 85.98,
      locationName: "Bay of Bengal (Central Corridor)"
    },
    speedKnots: 12.8,
    headingDeg: 342,
    courseOverGround: "342° (NNW)",
    eta: "18 Sep 2026, 14:30 IST",
    etaConfidence: "Medium",
    delayProbability: 18,
    expectedDelayHours: "4–8 hours",
    lastUpdated: "14 Sep 2026, 06:15 IST",
    routeId: "route-rec",
    totalDistanceNM: 4120,
    traveledDistanceNM: 2450,
    remainingDistanceNM: 1670,
    progressPercentage: 59.5,
    owner: "Pacific Bulk Carriers Pte Ltd",
    commercialCharterer: "Tata Steel Logistics"
  },
  {
    id: "VES-BHARAT",
    name: "MV Bharat Gaurav",
    imo: "9634921",
    callSign: "AWB884",
    mmsi: "419001420",
    flag: "India",
    vesselType: "Capesize",
    dwt: 178000,
    draft: 17.8,
    loa: 292.0,
    beam: 45.0,
    cargo: "Iron Ore Fines (160,000 MT)",
    currentPort: "Port Hedland, Australia (Departed)",
    originPort: "Port Hedland, Australia",
    destinationPort: "Paradip Port, India",
    destinationPortId: "paradip",
    nextPort: "Paradip Port",
    status: "Under Way Using Engine",
    currentPosition: {
      lat: 8.40,
      lng: 88.60,
      locationName: "South Bay of Bengal"
    },
    speedKnots: 13.4,
    headingDeg: 350,
    courseOverGround: "350° (N)",
    eta: "20 Sep 2026, 09:15 IST",
    etaConfidence: "Low",
    delayProbability: 42,
    expectedDelayHours: "24–36 hours (Anchorage Queue)",
    lastUpdated: "14 Sep 2026, 06:12 IST",
    routeId: "route-alt",
    totalDistanceNM: 3950,
    traveledDistanceNM: 2100,
    remainingDistanceNM: 1850,
    progressPercentage: 53.2,
    owner: "Great Eastern Shipping Co",
    commercialCharterer: "JSW Steel Global"
  },
  {
    id: "VES-PIONEER",
    name: "MV Bengal Pioneer",
    imo: "9512340",
    callSign: "9V8821",
    mmsi: "563004810",
    flag: "Singapore",
    vesselType: "Supramax",
    dwt: 58000,
    draft: 12.8,
    loa: 199.9,
    beam: 32.2,
    cargo: "Thermal Coal (53,000 MT)",
    currentPort: "Samarinda, Indonesia (Departed)",
    originPort: "Samarinda, Indonesia",
    destinationPort: "Visakhapatnam (Vizag)",
    destinationPortId: "vizag",
    nextPort: "Visakhapatnam (Vizag)",
    status: "Under Way Using Engine",
    currentPosition: {
      lat: 10.20,
      lng: 87.50,
      locationName: "Andaman Sea Transit"
    },
    speedKnots: 12.2,
    headingDeg: 315,
    courseOverGround: "315° (NW)",
    eta: "16 Sep 2026, 18:00 IST",
    etaConfidence: "High",
    delayProbability: 12,
    expectedDelayHours: "1–3 hours",
    lastUpdated: "14 Sep 2026, 06:14 IST",
    routeId: "route-short",
    totalDistanceNM: 2450,
    traveledDistanceNM: 1680,
    remainingDistanceNM: 770,
    progressPercentage: 68.6,
    owner: "Singapore Maritime Bulk Ltd",
    commercialCharterer: "NTPC Coastal Power"
  },
  {
    id: "VES-GLORY",
    name: "MV Indus Glory",
    imo: "9482110",
    callSign: "ELZX4",
    mmsi: "636018330",
    flag: "Liberia",
    vesselType: "Panamax",
    dwt: 76500,
    draft: 14.2,
    loa: 225.0,
    beam: 32.2,
    cargo: "Thermal Coal (70,000 MT)",
    currentPort: "Maputo, Mozambique (Departed)",
    originPort: "Maputo, Mozambique",
    destinationPort: "Haldia Dock Complex",
    destinationPortId: "haldia",
    nextPort: "Sandheads Anchorage (Lightering)",
    status: "Under Way Using Engine",
    currentPosition: {
      lat: 5.10,
      lng: 83.20,
      locationName: "South of Sri Lanka Corridor"
    },
    speedKnots: 13.1,
    headingDeg: 42,
    courseOverGround: "042° (NE)",
    eta: "22 Sep 2026, 11:30 IST",
    etaConfidence: "Medium",
    delayProbability: 35,
    expectedDelayHours: "18–24 hours (Draft Lightering)",
    lastUpdated: "14 Sep 2026, 06:10 IST",
    routeId: "route-rec",
    totalDistanceNM: 4600,
    traveledDistanceNM: 3150,
    remainingDistanceNM: 1450,
    progressPercentage: 68.5,
    owner: "Indus Seaways Ltd",
    commercialCharterer: "West Bengal Power Dev Corp"
  }
];

export const vesselTrackingService = {
  getAllVessels() {
    return TRACKED_VESSELS;
  },

  getVesselById(id) {
    return TRACKED_VESSELS.find(v => v.id === id || v.imo === id || v.name.toLowerCase() === id.toLowerCase()) || TRACKED_VESSELS[0];
  },

  async getLiveVesselsAsync() {
    try {
      const live = await apiClient.getLiveVessels();
      if (Array.isArray(live) && live.length > 0) {
        return live;
      }
    } catch (_) {}
    return TRACKED_VESSELS;
  },

  async getVoyageEtaPrediction(params) {
    try {
      return await apiClient.getVoyageEta(params);
    } catch (_) {
      return null;
    }
  },

  getAISMetadata() {
    return {
      dataSource: "AISStream Live Satellite AIS Feed",
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST",
      refreshIntervalSec: 5,
      satelliteCount: 14,
      coverage: "Global Dual-Channel Class A AIS (Indian Ocean / Bay of Bengal)"
    };
  },

  // Generates historical playback positions from origin to current position
  getPlaybackWaypoints(vesselId) {
    const vessel = this.getVesselById(vesselId);
    if (!vessel) return [];

    // Realistic historical interpolation points for playback
    if (vessel.id === "VES-STAR") {
      return [
        { time: "06 Sep, 08:00", lat: -23.85, lng: 151.27, label: "Departed Gladstone Berth 4", speed: 6.2, completedNM: 0 },
        { time: "07 Sep, 14:00", lat: -18.20, lng: 148.50, label: "Coral Sea Deep Water Pass", speed: 13.2, completedNM: 380 },
        { time: "09 Sep, 02:00", lat: -10.50, lng: 142.10, label: "Torres Strait Outskirts", speed: 12.5, completedNM: 890 },
        { time: "10 Sep, 18:00", lat: -8.80, lng: 133.50, label: "Arafura Sea Transit", speed: 13.0, completedNM: 1420 },
        { time: "12 Sep, 06:00", lat: -6.00, lng: 105.80, label: "Sunda Strait Deep Water Waypoint", speed: 11.8, completedNM: 1890 },
        { time: "13 Sep, 12:00", lat: 5.50, lng: 92.50, label: "Nicobar Six Degree Channel Entrance", speed: 13.1, completedNM: 2180 },
        { time: "14 Sep, 06:15", lat: 13.85, lng: 85.98, label: "Current AIS Position (Bay of Bengal)", speed: 12.8, completedNM: 2450 }
      ];
    } else {
      // Default 5 points
      const origLat = vessel.currentPosition.lat - 12;
      const origLng = vessel.currentPosition.lng + 14;
      return [
        { time: "Day 1", lat: origLat, lng: origLng, label: "Departure Port", speed: 11.5, completedNM: 0 },
        { time: "Day 3", lat: origLat + 4, lng: origLng - 5, label: "Mid-Voyage Waypoint 1", speed: 13.0, completedNM: 600 },
        { time: "Day 5", lat: origLat + 8, lng: origLng - 10, label: "Corridor Waypoint 2", speed: 13.4, completedNM: 1300 },
        { time: "Current", lat: vessel.currentPosition.lat, lng: vessel.currentPosition.lng, label: "Current Live AIS", speed: vessel.speedKnots, completedNM: vessel.traveledDistanceNM }
      ];
    }
  }
};
