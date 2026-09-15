import { FLEET_VESSELS, PORTS, DATA_METADATA } from './demoData';
import { portService } from './portService';

export const vesselService = {
  getMetadata() {
    return DATA_METADATA;
  },

  async getAllVessels(filters = {}) {
    let result = [...FLEET_VESSELS];

    if (filters.type && filters.type !== 'All') {
      result = result.filter(v => v.type.toLowerCase() === filters.type.toLowerCase());
    }
    if (filters.status && filters.status !== 'All') {
      result = result.filter(v => v.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.maxDraft) {
      result = result.filter(v => v.draft <= parseFloat(filters.maxDraft));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(q) || 
        v.imo.includes(q) || 
        v.type.toLowerCase().includes(q) ||
        v.owner.toLowerCase().includes(q)
      );
    }

    return {
      metadata: DATA_METADATA,
      vessels: result
    };
  },

  async getVesselById(id) {
    const vessel = FLEET_VESSELS.find(v => v.id === id || v.imo === id || v.name.toLowerCase().includes(id.toLowerCase()));
    return {
      metadata: DATA_METADATA,
      vessel: vessel || FLEET_VESSELS[0]
    };
  },

  // Intelligent matching engine based on cargo requirements
  async matchVesselsForCargo({ cargoQuantity = 75000, destinationPortId = "dhamra", preferredLoadingDate, priority = "Best Balance" }) {
    const port = PORTS.find(p => p.id === destinationPortId) || PORTS[0];

    const matched = FLEET_VESSELS.map(vessel => {
      const compatibility = portService.checkCompatibility(vessel, port);

      // Deadheading and repositioning calculation
      let deadheadingScore = Math.max(10, 100 - (vessel.deadheadingDistanceNM / 10));
      let capacityUtilization = (cargoQuantity / vessel.dwt) * 100;
      let capacityScore = capacityUtilization >= 80 && capacityUtilization <= 102 ? 95 : 70;

      // Composite match score
      let matchScore = Math.round(
        (compatibility.score * 0.40) + 
        (capacityScore * 0.25) + 
        (deadheadingScore * 0.20) + 
        (vessel.efficiencyScore * 0.15)
      );

      // Priority adjustments
      if (priority === "Lowest Cost") {
        if (vessel.type === "Capesize") matchScore += 5;
        if (vessel.deadheadingCostUSD > 20000) matchScore -= 8;
      } else if (priority === "Lowest Risk") {
        if (compatibility.verdict === "Compatible") matchScore += 5;
        if (vessel.status === "Available") matchScore += 5;
      }

      return {
        ...vessel,
        portCompatibility: compatibility,
        matchScore: Math.min(99, Math.max(20, matchScore)),
        capacityUtilization: Math.round(capacityUtilization)
      };
    });

    // Sort by matchScore descending
    matched.sort((a, b) => b.matchScore - a.matchScore);

    return {
      metadata: DATA_METADATA,
      matchedVessels: matched,
      recommendedVessel: matched[0],
      destinationPort: port
    };
  },

  // Shipowner feature: update availability
  updateVesselAvailability(vesselId, { status, availabilityDate }) {
    const target = FLEET_VESSELS.find(v => v.id === vesselId);
    if (target) {
      if (status) target.status = status;
      if (availabilityDate) target.availabilityDate = availabilityDate;
    }
    return { success: true, vessel: target };
  }
};
