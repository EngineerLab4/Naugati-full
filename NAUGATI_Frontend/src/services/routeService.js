// NAUGATI Maritime Intelligence — Route Optimization & Navigation Engine
// Calculates multi-objective route comparisons, shortcut identification, risk scores, and port draft compatibility.

import { PORTS, DATA_METADATA } from './demoData';
import { TRACKED_VESSELS } from './vesselTrackingService';

export const COMPREHENSIVE_ROUTES = [
  {
    id: "route-rec",
    title: "Route 1 — Sunda Deep-Water Pass",
    displayName: "Recommended Route",
    type: "recommended",
    origin: "Gladstone, Australia",
    originCoords: [151.27, -23.85], // [lng, lat]
    destination: "Dhamra Port, India",
    destinationPortId: "dhamra",
    destinationCoords: [86.9745, 20.8133],
    distanceNM: 2060, // Remaining segment from current mid-voyage position: 1,670 NM
    fullVoyageDistanceNM: 4120,
    voyageDays: 7.08, // 7d 02h
    voyageDurationFormatted: "7d 02h",
    speedKnots: 12.8,
    fuelConsumptionMT: 1185,
    estimatedCostUSD: 342000,
    riskLevel: "Low–Medium",
    congestionLevel: "Low",
    overallScore: 86,
    scoreBreakdown: {
      distance: 92,
      eta: 88,
      fuel: 84,
      weather: 78,
      congestion: 91,
      geopolitical: 90,
      navigation: 89
    },
    whyRecommended: "Best overall balance of ETA, operating cost, weather swell avoidance, and zero choke-point congestion.",
    color: "#04ADDE",
    dashArray: null,
    waypoints: [
      { name: "Gladstone Berth", lat: -23.85, lng: 151.27, type: "origin" },
      { name: "Coral Sea Deep Trench", lat: -18.20, lng: 148.50, type: "passage" },
      { name: "Torres Strait Outskirts", lat: -10.50, lng: 142.10, type: "waypoint" },
      { name: "Arafura Sea Deep Corridor", lat: -8.80, lng: 133.50, type: "waypoint" },
      { name: "Sunda Strait Deep Water", lat: -6.00, lng: 105.80, type: "strait" },
      { name: "Current Vessel Position (MV Ocean Star)", lat: 13.85, lng: 85.98, type: "vessel" },
      { name: "Bay of Bengal Swell Buffer", lat: 17.50, lng: 86.40, type: "waypoint" },
      { name: "Dhamra Fairway Buoy", lat: 20.50, lng: 87.05, type: "pilot" },
      { name: "Dhamra Port Berth 1", lat: 20.8133, lng: 86.9745, type: "destination" }
    ]
  },
  {
    id: "route-alt",
    title: "Route 2 — Malacca Strait Highway",
    displayName: "Alternative Route",
    type: "alternative",
    origin: "Gladstone, Australia",
    originCoords: [151.27, -23.85],
    destination: "Dhamra Port, India",
    destinationPortId: "dhamra",
    destinationCoords: [86.9745, 20.8133],
    distanceNM: 2230,
    fullVoyageDistanceNM: 4380,
    voyageDays: 7.83, // 7d 20h
    voyageDurationFormatted: "7d 20h",
    speedKnots: 12.8,
    fuelConsumptionMT: 1310,
    estimatedCostUSD: 378000,
    riskLevel: "Medium",
    congestionLevel: "High",
    overallScore: 74,
    scoreBreakdown: {
      distance: 78,
      eta: 72,
      fuel: 75,
      weather: 85,
      congestion: 58,
      geopolitical: 72,
      navigation: 78
    },
    whyRecommended: "Standard commercial route via Singapore bunkering hub, but encounters high TSS traffic density (>220 ships/day) and 18h longer voyage duration.",
    color: "#94a3b8",
    dashArray: "6, 6",
    waypoints: [
      { name: "Gladstone Berth", lat: -23.85, lng: 151.27, type: "origin" },
      { name: "Coral Sea Waypoint", lat: -15.00, lng: 148.00, type: "waypoint" },
      { name: "Lombok Strait", lat: -8.70, lng: 115.70, type: "strait" },
      { name: "Java Sea Corridor", lat: -4.50, lng: 110.00, type: "waypoint" },
      { name: "Singapore Strait TSS", lat: 1.25, lng: 103.80, type: "chokepoint" },
      { name: "Current Projected Position", lat: 13.85, lng: 85.98, type: "vessel" },
      { name: "Malacca Strait North Gate", lat: 5.50, lng: 97.50, type: "waypoint" },
      { name: "Nicobar Six Degree Channel", lat: 7.80, lng: 93.70, type: "waypoint" },
      { name: "Dhamra Port Berth 1", lat: 20.8133, lng: 86.9745, type: "destination" }
    ]
  },
  {
    id: "route-short",
    title: "Route 3 — Torres Reef Direct Pass",
    displayName: "Shortcut Route",
    type: "shortcut",
    origin: "Gladstone, Australia",
    originCoords: [151.27, -23.85],
    destination: "Dhamra Port, India",
    destinationPortId: "dhamra",
    destinationCoords: [86.9745, 20.8133],
    distanceNM: 1940, // 120 NM shorter than recommended
    fullVoyageDistanceNM: 4000,
    voyageDays: 6.58, // 6d 14h (12 hours saved)
    voyageDurationFormatted: "6d 14h",
    speedKnots: 13.0,
    fuelConsumptionMT: 1130, // 55 MT saved
    estimatedCostUSD: 325500, // $16,500 saved
    riskLevel: "Medium",
    congestionLevel: "Medium",
    overallScore: 81,
    timeSavedHours: 12,
    distanceSavedNM: 120,
    fuelSavedMT: 55,
    costSavedUSD: 16500,
    scoreBreakdown: {
      distance: 98,
      eta: 96,
      fuel: 94,
      weather: 76,
      congestion: 82,
      geopolitical: 90,
      navigation: 62 // Lower score due to shallow channel draft restriction
    },
    whyRecommended: "Reduces approximately 120 nautical miles and saves 12 hours of voyage time. However, it requires mandatory Torres Strait coastal pilotage and has shallow reef draft windows.",
    color: "#10b981",
    dashArray: "3, 3",
    waypoints: [
      { name: "Gladstone Berth", lat: -23.85, lng: 151.27, type: "origin" },
      { name: "Inner Reef Track", lat: -16.20, lng: 146.00, type: "waypoint" },
      { name: "Prince of Wales Channel", lat: -10.50, lng: 142.20, type: "restriction" },
      { name: "Current Projected Position", lat: 13.85, lng: 85.98, type: "vessel" },
      { name: "Banda Sea Direct", lat: -5.00, lng: 128.00, type: "waypoint" },
      { name: "Indian Ocean Direct Vector", lat: 6.00, lng: 90.00, type: "waypoint" },
      { name: "Bay of Bengal Center", lat: 14.50, lng: 86.80, type: "waypoint" },
      { name: "Dhamra Port Berth 1", lat: 20.8133, lng: 86.9745, type: "destination" }
    ]
  }
];

export const routeService = {
  getMetadata() {
    return DATA_METADATA;
  },

  // Dynamic Route Optimization according to selected vessel, ports, and objective
  getOptimizedRoutes({ 
    vesselId = "VES-STAR", 
    originPort = "Gladstone, Australia", 
    destinationPortId = "dhamra", 
    objective = "Best Overall" 
  }) {
    const vessel = TRACKED_VESSELS.find(v => v.id === vesselId) || TRACKED_VESSELS[0];
    const destinationPort = PORTS.find(p => p.id === destinationPortId) || PORTS[0];

    // Compute dynamic weights for objective
    let routes = COMPREHENSIVE_ROUTES.map(r => {
      let score = r.overallScore;

      if (objective === "Fastest Arrival") {
        if (r.type === "shortcut") score += 12;
        if (r.type === "alternative") score -= 8;
      } else if (objective === "Lowest Fuel Cost") {
        if (r.fuelConsumptionMT < 1200) score += 9;
        if (r.fuelConsumptionMT > 1300) score -= 10;
      } else if (objective === "Lowest Operating Cost") {
        if (r.estimatedCostUSD < 330000) score += 8;
      } else if (objective === "Lowest Risk") {
        if (r.riskLevel.includes("Low")) score += 10;
        if (r.type === "shortcut") score -= 14; // Shortcut has shallow draft navigation risk
      }

      return {
        ...r,
        destination: destinationPort.name,
        destinationPortId: destinationPort.id,
        destinationCoords: destinationPort.coordinates,
        calculatedScore: Math.min(99, Math.max(40, score))
      };
    });

    // Sort by calculated score
    routes.sort((a, b) => b.calculatedScore - a.calculatedScore);

    const recommended = routes[0];
    const shortcut = routes.find(r => r.type === "shortcut") || routes[2];
    const alternative = routes.find(r => r.type === "alternative") || routes[1];

    // Check draft compatibility
    const compatibility = this.checkPortCompatibility(vessel, destinationPort);

    return {
      metadata: DATA_METADATA,
      routes,
      recommendedRoute: recommended,
      alternativeRoute: alternative,
      shortcutRoute: shortcut,
      compatibility,
      objective,
      vessel,
      destinationPort
    };
  },

  // Check vessel draft and LOA against destination port parameters
  checkPortCompatibility(vessel, port) {
    const isDraftSafe = vessel.draft <= port.maxDraft;
    const isLOASafe = vessel.loa <= port.maxLOA;
    const draftMargin = +(port.maxDraft - vessel.draft).toFixed(1);

    let status = "Compatible";
    let warningMessage = null;

    if (!isDraftSafe) {
      status = "Incompatible Draft";
      warningMessage = `Vessel draft (${vessel.draft}m) exceeds ${port.name} allowable draft (${port.maxDraft}m) by ${Math.abs(draftMargin)}m. Lightering or tide waiting required.`;
    } else if (draftMargin < 0.8) {
      status = "Tight Draft Margin";
      warningMessage = `Under-keel clearance is only ${draftMargin}m. Berthing requires high-tide pilotage window.`;
    }

    return {
      status,
      isCompatible: isDraftSafe,
      vesselDraft: vessel.draft,
      portMaxDraft: port.maxDraft,
      draftMargin,
      isLOASafe,
      vesselLOA: vessel.loa,
      portMaxLOA: port.maxLOA,
      warningMessage
    };
  },

  // Splits a route into completed traveled segment vs remaining segment
  getRouteProgressSegments(route, currentVesselPosition) {
    const allWaypoints = route.waypoints;
    const currentLat = currentVesselPosition.lat;
    const currentLng = currentVesselPosition.lng;

    // Find the closest waypoint index or split point
    // Completed: from index 0 to current position
    const traveledWaypoints = [
      allWaypoints[0],
      allWaypoints[1] || allWaypoints[0],
      allWaypoints[2] || allWaypoints[0],
      allWaypoints[3] || allWaypoints[0],
      allWaypoints[4] || allWaypoints[0],
      { name: "Current Vessel Position", lat: currentLat, lng: currentLng, type: "vessel" }
    ];

    // Remaining: from current position to destination
    const remainingWaypoints = [
      { name: "Current Vessel Position", lat: currentLat, lng: currentLng, type: "vessel" },
      allWaypoints[6] || allWaypoints[allWaypoints.length - 2],
      allWaypoints[7] || allWaypoints[allWaypoints.length - 1],
      allWaypoints[allWaypoints.length - 1]
    ];

    return {
      traveledWaypoints,
      remainingWaypoints
    };
  },

  async getRoutes({ origin = "Australia", destination = "Dhamra", priority = "Best Balance" }) {
    const objectiveMap = {
      "Lowest Cost": "Lowest Operating Cost",
      "Fastest Delivery": "Fastest Arrival",
      "Best Balance": "Best Overall",
      "Lowest Risk": "Lowest Risk"
    };
    return this.getOptimizedRoutes({
      originPort: origin,
      destinationPortId: destination.toLowerCase().includes("paradip") ? "paradip" : "dhamra",
      objective: objectiveMap[priority] || "Best Overall"
    });
  },

  calculateEta({ departureDate = "2026-09-20", voyageDays = 7.08, portWaitingDays = 1.8 }) {
    const dep = new Date(departureDate);
    const oceanArr = new Date(dep.getTime() + voyageDays * 24 * 3600 * 1000);
    const berthing = new Date(oceanArr.getTime() + portWaitingDays * 24 * 3600 * 1000);
    const completion = new Date(berthing.getTime() + 1.5 * 24 * 3600 * 1000);

    const formatDt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " + d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });

    return {
      estimatedOceanArrival: formatDt(oceanArr),
      estimatedBerthing: formatDt(berthing),
      estimatedCompletion: formatDt(completion),
      delayProbability: portWaitingDays > 2.5 ? "42%" : "24%",
      expectedDelayDays: +(portWaitingDays * 0.4).toFixed(1),
      primaryDelayFactors: [
        { factor: "Bay of Bengal Seasonal Swell", impact: "+0.3 days", severity: "low" },
        { factor: "Mechanised Terminal Berth Queue", impact: `+${portWaitingDays.toFixed(1)} days`, severity: portWaitingDays > 2.5 ? "medium" : "low" }
      ],
      milestones: [
        { name: "Ocean Departure", date: "Departs Day 0", status: "completed" },
        { name: "Strait Transit Corridor", date: `+${(voyageDays * 0.35).toFixed(1)} Days`, status: "scheduled" },
        { name: "Pilot Boarding Station", date: `+${voyageDays.toFixed(1)} Days`, status: "scheduled" },
        { name: "Berthing & Discharge", date: `+${(voyageDays + portWaitingDays).toFixed(1)} Days`, status: "scheduled" },
        { name: "Cargo Handover Completed", date: `+${(voyageDays + portWaitingDays + 1.5).toFixed(1)} Days`, status: "scheduled" }
      ]
    };
  }
};

