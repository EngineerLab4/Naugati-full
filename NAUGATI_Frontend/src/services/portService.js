import { PORTS, DATA_METADATA } from './demoData';

export const portService = {
  getMetadata() {
    return DATA_METADATA;
  },

  async getAllPorts() {
    return {
      metadata: DATA_METADATA,
      ports: PORTS
    };
  },

  async getPortById(id) {
    const port = PORTS.find(p => p.id.toLowerCase() === id.toLowerCase() || p.name.toLowerCase().includes(id.toLowerCase()));
    return {
      metadata: DATA_METADATA,
      port: port || PORTS[0]
    };
  },

  // RULE-BASED / CONSTRAINT-BASED COMPATIBILITY ENGINE
  checkCompatibility(vessel, port) {
    if (!vessel || !port) {
      return {
        verdict: "Unknown",
        score: 0,
        reasons: ["Insufficient vessel or port parameters."],
        constraints: []
      };
    }

    const draftDiff = +(port.maxDraft - vessel.draft).toFixed(2);
    const loaDiff = +(port.maxLOA - vessel.loa).toFixed(1);
    const beamDiff = +(port.maxBeam - vessel.beam).toFixed(1);

    const draftPass = draftDiff >= 0;
    const loaPass = loaDiff >= 0;
    const beamPass = beamDiff >= 0;

    const constraints = [
      {
        criterion: "Draft Permissibility",
        vesselValue: `${vessel.draft} m`,
        portLimit: `${port.maxDraft} m max`,
        pass: draftPass,
        margin: `${draftDiff >= 0 ? '+' : ''}${draftDiff} m`,
        critical: true
      },
      {
        criterion: "Length Overall (LOA)",
        vesselValue: `${vessel.loa} m`,
        portLimit: `${port.maxLOA} m max`,
        pass: loaPass,
        margin: `${loaDiff >= 0 ? '+' : ''}${loaDiff} m`,
        critical: true
      },
      {
        criterion: "Beam Width",
        vesselValue: `${vessel.beam} m`,
        portLimit: `${port.maxBeam} m max`,
        pass: beamPass,
        margin: `${beamDiff >= 0 ? '+' : ''}${beamDiff} m`,
        critical: false
      }
    ];

    let verdict = "Compatible";
    let statusClass = "positive";
    const reasons = [];

    if (!draftPass) {
      verdict = "Not Compatible";
      statusClass = "critical";
      reasons.push(`Vessel laden draft (${vessel.draft}m) exceeds port's maximum permissible draft of ${port.maxDraft}m by ${Math.abs(draftDiff)}m.`);
    } else if (draftDiff < 0.8) {
      verdict = "Conditionally Compatible";
      statusClass = "warning";
      reasons.push(`Under-keel clearance (UKC) is slim (${draftDiff}m). Navigation is tide-dependent and requires high-water berthing window.`);
    }

    if (!loaPass) {
      verdict = "Not Compatible";
      statusClass = "critical";
      reasons.push(`Vessel LOA (${vessel.loa}m) exceeds berth length capacity of ${port.maxLOA}m.`);
    }

    if (!beamPass) {
      if (verdict !== "Not Compatible") {
        verdict = "Conditionally Compatible";
        statusClass = "warning";
      }
      reasons.push(`Vessel beam (${vessel.beam}m) exceeds standard crane outreach limit (${port.maxBeam}m). Specialized dual-crane handling required.`);
    }

    if (reasons.length === 0) {
      reasons.push(`Fully compatible with ${port.name}. Vessel dimensions are well within draft, LOA, and beam constraints.`);
    }

    // Quantitative decision-support score (0 - 100)
    let score = 95;
    if (verdict === "Not Compatible") score = 25;
    else if (verdict === "Conditionally Compatible") score = 72;
    else {
      // Small deduction if close to limit
      if (draftDiff < 1.5) score -= 5;
    }

    return {
      verdict,
      statusClass,
      score,
      constraints,
      reasons,
      portName: port.name,
      vesselName: vessel.name,
      vesselType: vessel.type,
      currentCongestion: port.currentCongestion,
      averageTurnaroundHours: port.averageTurnaroundHours
    };
  },

  async getPortCongestionPrediction(portName, vesselsWaiting = null) {
    try {
      const res = await apiClient.getPortCongestion({
        port_name: portName,
        vessels_waiting: vesselsWaiting,
      });
      if (res && res.congestion_level) {
        return res;
      }
    } catch (err) {
      console.warn('[portService] Prediction call failed, using baseline.', err.message);
    }
    return {
      port_name: portName,
      congestion_level: 'Medium',
      average_waiting_hours: 24.5,
      average_waiting_days: 1.0,
      vessels_in_queue: 5,
      congestion_score: 50.0,
      berth_turnaround_hours: 36.0,
      delay_risk: `Queue observed near ${portName}. Expected berthing in ~1 day.`,
      model_version: 'port_congestion_v1',
    };
  }
};

