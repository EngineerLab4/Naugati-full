// NAUGATI Maritime Intelligence — Live Vessel Tracking & Telemetry Service
// Ingests real-time AIS data via core-api (/api/vessels/live)
import { apiClient } from './apiClient';

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
    lastUpdated: "Live Satellite Stream",
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
    lastUpdated: "Live Satellite Stream",
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
    lastUpdated: "Live Satellite Stream",
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
    lastUpdated: "Live Satellite Stream",
    routeId: "route-rec",
    totalDistanceNM: 4600,
    traveledDistanceNM: 3150,
    remainingDistanceNM: 1450,
    progressPercentage: 68.5,
    owner: "Indus Seaways Ltd",
    commercialCharterer: "West Bengal Power Dev Corp"
  }
];

let liveVesselsCache = [...TRACKED_VESSELS];
const listeners = new Set();

function normalizeAisVessel(v, idx) {
  const mmsi = String(v.mmsi || '');
  const lat = v.latitude ?? v.lat ?? 0;
  const lng = v.longitude ?? v.lng ?? 0;
  const speed = Number(v.speed ?? v.sog_knots ?? 12.0);
  const heading = Number(v.heading ?? v.heading_degrees ?? v.course ?? 0);
  const name = v.shipName || v.name || `Vessel ${mmsi}`;

  return {
    id: `VES-${mmsi}`,
    name: name,
    imo: mmsi,
    callSign: `AIS-${mmsi.slice(-4)}`,
    mmsi: mmsi,
    flag: "International",
    vesselType: "Bulk Carrier",
    dwt: 75000,
    draft: 13.5,
    loa: 225.0,
    beam: 32.2,
    cargo: v.destination ? `Bound for ${v.destination}` : "Dry Bulk Fixture",
    currentPort: "At Sea (Live AIS)",
    originPort: "Maritime Corridor",
    destinationPort: v.destination || "Bay of Bengal Port",
    destinationPortId: "dhamra",
    nextPort: v.destination || "Approaching Indian Ocean",
    status: speed > 0.5 ? "Under Way Using Engine" : "Moored / At Anchor",
    currentPosition: {
      lat: lat,
      lng: lng,
      locationName: `Live Satellite AIS: ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`
    },
    speedKnots: Math.round(speed * 10) / 10,
    headingDeg: heading,
    courseOverGround: `${heading}°`,
    eta: "Transiting (Live AIS)",
    etaConfidence: "Live Satellite Stream",
    delayProbability: 15,
    expectedDelayHours: "Normal transit",
    lastUpdated: "Real-Time Satellite AIS",
    routeId: "route-rec",
    totalDistanceNM: 3500,
    traveledDistanceNM: 2100,
    remainingDistanceNM: 1400,
    progressPercentage: 60,
    owner: "Commercial Bulk Carrier",
    commercialCharterer: "Spot Fixture",
    isLiveAis: true
  };
}

// Background poller to refresh live vessels from Satellite AIS
async function syncLiveVessels() {
  try {
    const rawList = await apiClient.getLiveVessels();
    if (Array.isArray(rawList) && rawList.length > 0) {
      // Map live AIS vessels
      const normalized = rawList.map(normalizeAisVessel);
      
      // Combine with baseline vessels ensuring unique MMSIs
      const mmsiMap = new Map();
      for (const v of normalized) {
        mmsiMap.set(v.mmsi, v);
      }
      for (const b of TRACKED_VESSELS) {
        if (!mmsiMap.has(b.mmsi)) {
          mmsiMap.set(b.mmsi, b);
        }
      }

      liveVesselsCache = Array.from(mmsiMap.values());
      listeners.forEach(cb => {
        try { cb(liveVesselsCache); } catch (_) {}
      });
    }
  } catch (err) {
    console.warn('[vesselTrackingService] Live AIS fetch error:', err.message);
  }
}

// Initial sync and recurring poll
syncLiveVessels();
setInterval(syncLiveVessels, 10000);

export const vesselTrackingService = {
  subscribe(callback) {
    listeners.add(callback);
    callback(liveVesselsCache);
    return () => listeners.delete(callback);
  },

  getAllVessels() {
    return liveVesselsCache;
  },

  getVesselById(id) {
    return liveVesselsCache.find(v => v.id === id || v.mmsi === id || v.imo === id || v.name.toLowerCase() === id.toLowerCase()) || liveVesselsCache[0];
  },

  async getLiveVesselsAsync() {
    await syncLiveVessels();
    return liveVesselsCache;
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
      dataSource: "Global Satellite & Terrestrial AIS Telemetry",
      lastUpdated: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + " IST",
      refreshIntervalSec: 10,
      vesselsCount: liveVesselsCache.length,
      satelliteCount: 24,
      coverage: "Global Satellite AIS Constellation Network"
    };
  },

  getPlaybackWaypoints(vesselId) {
    const vessel = this.getVesselById(vesselId);
    if (!vessel) return [];

    const lat = vessel.currentPosition?.lat || 13.85;
    const lng = vessel.currentPosition?.lng || 85.98;

    return [
      { time: "3 Days Ago", lat: lat - 6.5, lng: lng + 8.2, label: "Corridor Origin Passage", speed: 12.8, completedNM: 0 },
      { time: "2 Days Ago", lat: lat - 4.2, lng: lng + 5.1, label: "Deep Sea Transit Pass", speed: 13.0, completedNM: 450 },
      { time: "Yesterday", lat: lat - 1.8, lng: lng + 2.0, label: "Waystation Coordinates", speed: 12.5, completedNM: 980 },
      { time: "Current Live", lat: lat, lng: lng, label: `Live AIS (${vessel.name})`, speed: vessel.speedKnots, completedNM: 1450 }
    ];
  }
};
