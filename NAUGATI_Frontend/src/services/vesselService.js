import { FLEET_VESSELS, PORTS, DATA_METADATA } from './demoData';
import { portService } from './portService';
import { apiClient } from './apiClient';

export const vesselService = {
  getMetadata() {
    return DATA_METADATA;
  },

  async getAllVessels(filters = {}) {
    let result = [...FLEET_VESSELS];

    try {
      const live = await apiClient.getLiveVessels();
      if (Array.isArray(live) && live.length > 0) {
        result = live.map((lv, idx) => ({
          id: String(lv.mmsi || idx),
          name: lv.vessel_name || `AIS Vessel ${lv.mmsi}`,
          imo: String(lv.imo || lv.mmsi),
          type: lv.vessel_type || 'Panamax',
          dwt: lv.dwt || 75000,
          draft: lv.draft || 12.5,
          status: lv.nav_status || 'Available',
          currentPosition: {
            lat: lv.latitude || 18.5,
            lng: lv.longitude || 86.2,
            locationName: lv.destination || 'Bay of Bengal'
          },
          speedKnots: lv.speed_over_ground || 13.0,
          efficiencyScore: 92,
          matchScore: 90
        }));
      }
    } catch (_) {
      // Keep baseline if offline
    }

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
        v.type.toLowerCase().includes(q)
      );
    }

    return {
      metadata: DATA_METADATA,
      vessels: result
    };
  },

  async getVesselById(id) {
    try {
      const res = await apiClient.getVesselByMmsi(id);
      if (res && res.vessel_name) {
        return {
          metadata: DATA_METADATA,
          vessel: {
            id: String(res.mmsi),
            name: res.vessel_name,
            imo: String(res.imo || res.mmsi),
            type: res.vessel_type || 'Panamax',
            dwt: res.dwt || 75000,
            draft: res.draft || 12.5,
            status: res.nav_status || 'Under Voyage',
            currentPosition: {
              lat: res.latitude,
              lng: res.longitude,
              locationName: res.destination || 'At Sea'
            },
            speedKnots: res.speed_over_ground || 13.0,
            efficiencyScore: 94
          }
        };
      }
    } catch (_) {}

    const vessel = FLEET_VESSELS.find(v => v.id === id || v.imo === id || v.name.toLowerCase().includes(id.toLowerCase()));
    return {
      metadata: DATA_METADATA,
      vessel: vessel || FLEET_VESSELS[0]
    };
  },

  /**
   * Intelligent vessel matching backed by the trained Operations Research Charter Optimizer
   */
  async matchVesselsForCargo({ cargoQuantity = 75000, destinationPortId = "paradip", preferredLoadingDate, priority = "Best Balance" }) {
    const port = PORTS.find(p => p.id === destinationPortId) || PORTS[1] || PORTS[0];

    try {
      // Call backend OR charter optimizer
      const optimizerRes = await apiClient.optimizeCharter({
        cargo_quantity_mt: cargoQuantity,
        route_distance_nm: 5000,
        port_draft_limit_m: port.maxDraft,
        bunker_price_usd_mt: 600,
        freight_rates: {
          Handysize: 25.0,
          Supramax: 23.5,
          Panamax: 22.0,
          Capesize: 20.5
        },
        congestion_level: port.currentCongestion === 'High' ? "HIGH" : "MEDIUM",
        wave_height_m: 2.0
      });

      if (optimizerRes && optimizerRes.candidates) {
        const matched = optimizerRes.candidates.map((c, idx) => {
          const isOptimal = c.vessel_type === optimizerRes.recommendation?.vessel_type;
          const dwt = c.vessel_type === 'Capesize' ? 175000 : c.vessel_type === 'Panamax' ? 75000 : c.vessel_type === 'Supramax' ? 58000 : 35000;
          const draft = c.vessel_type === 'Capesize' ? 17.5 : c.vessel_type === 'Panamax' ? 13.5 : c.vessel_type === 'Supramax' ? 12.5 : 10.0;

          return {
            id: `or-${c.vessel_type.toLowerCase()}-${idx}`,
            name: `${c.vessel_type} Fleet Unit (${dwt.toLocaleString()} DWT)`,
            imo: `98765${idx}4`,
            owner: 'Commercial Bulk Carriers Pool',
            type: c.vessel_type,
            dwt,
            draft,
            speedKnots: c.vessel_type === 'Capesize' ? 14.0 : 13.0,
            status: c.feasible ? 'Available' : 'Draft Infeasible',
            feasible: c.feasible,
            voyagesRequired: c.voyages_required,
            estimatedFreightUSDPerMT: c.final_cost_per_mt || c.freight_rate_usd_mt || 25.0,
            deadheadingDistanceNM: 250,
            efficiencyScore: isOptimal ? 96 : 88,
            matchScore: isOptimal ? 98 : c.feasible ? 86 : 35,
            portCompatibility: {
              score: c.feasible ? 96 : 20,
              verdict: c.feasible ? 'Compatible' : 'Exceeds Draft Limit',
              draftMargin: c.draft_margin_m
            },
            capacityUtilization: Math.min(100, Math.round((cargoQuantity / (dwt * c.voyages_required)) * 100))
          };
        });

        matched.sort((a, b) => b.matchScore - a.matchScore);

        return {
          metadata: DATA_METADATA,
          matchedVessels: matched,
          recommendedVessel: matched[0],
          destinationPort: port
        };
      }
    } catch (err) {
      console.warn("Optimizer matching failed, using rule-based solver:", err.message);
    }

    // Fallback rule solver using port compatibility
    const matched = FLEET_VESSELS.map(vessel => {
      const compatibility = portService.checkCompatibility(vessel, port);
      let deadheadingScore = Math.max(10, 100 - (vessel.deadheadingDistanceNM / 10));
      let capacityUtilization = (cargoQuantity / vessel.dwt) * 100;
      let capacityScore = capacityUtilization >= 80 && capacityUtilization <= 102 ? 95 : 70;

      let matchScore = Math.round(
        (compatibility.score * 0.40) + 
        (capacityScore * 0.25) + 
        (deadheadingScore * 0.20) + 
        (vessel.efficiencyScore * 0.15)
      );

      return {
        ...vessel,
        portCompatibility: compatibility,
        matchScore: Math.min(99, Math.max(20, matchScore)),
        capacityUtilization: Math.round(capacityUtilization)
      };
    });

    matched.sort((a, b) => b.matchScore - a.matchScore);

    return {
      metadata: DATA_METADATA,
      matchedVessels: matched,
      recommendedVessel: matched[0],
      destinationPort: port
    };
  },

  updateVesselAvailability(vesselId, { status, availabilityDate }) {
    const target = FLEET_VESSELS.find(v => v.id === vesselId);
    if (target) {
      if (status) target.status = status;
      if (availabilityDate) target.availabilityDate = availabilityDate;
    }
    return { success: true, vessel: target };
  }
};
