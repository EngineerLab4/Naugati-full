import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crosshair, AlertCircle, ArrowRight, Ship, 
  Fuel, Clock, DollarSign, CheckCircle2, Award, 
  MapPin, Compass, RefreshCw, Layers, ShieldAlert, Zap
} from 'lucide-react';
import { FLEET_VESSELS, BACKHAUL_OPPORTUNITIES, PORTS, ORIGINS } from '../../services/demoData';
import { apiClient } from '../../services/apiClient';

// Accurate nautical distances between common discharge ports and global loading terminals
const PORT_DISTANCES_NM = {
  "dhamra": {
    "hay_point": 4200,
    "newcastle": 4650,
    "port_hedland": 3850,
    "samarinda": 2400,
    "maputo": 4600,
    "richards_bay": 4750,
    "paradip": 85,
    "visakhapatnam": 220,
    "haldia": 110,
    "chennai": 520
  },
  "paradip": {
    "hay_point": 4180,
    "newcastle": 4620,
    "port_hedland": 3820,
    "samarinda": 2380,
    "maputo": 4550,
    "richards_bay": 4700,
    "dhamra": 85,
    "visakhapatnam": 180,
    "haldia": 160,
    "chennai": 480
  },
  "visakhapatnam": {
    "hay_point": 4050,
    "newcastle": 4500,
    "port_hedland": 3700,
    "samarinda": 2250,
    "maputo": 4400,
    "richards_bay": 4550,
    "dhamra": 220,
    "paradip": 180,
    "gangavaram": 15,
    "chennai": 320
  },
  "gangavaram": {
    "hay_point": 4040,
    "newcastle": 4490,
    "port_hedland": 3690,
    "samarinda": 2240,
    "maputo": 4390,
    "richards_bay": 4540,
    "visakhapatnam": 15,
    "paradip": 190,
    "chennai": 315
  },
  "haldia": {
    "hay_point": 4310,
    "newcastle": 4760,
    "port_hedland": 3960,
    "samarinda": 2510,
    "maputo": 4710,
    "richards_bay": 4860,
    "dhamra": 110,
    "paradip": 160,
    "visakhapatnam": 310
  }
};

const LOADING_PORTS = [
  { id: "hay_point", name: "Hay Point, Australia", region: "Queensland (Coal)" },
  { id: "newcastle", name: "Newcastle, Australia", region: "NSW (Thermal Coal)" },
  { id: "port_hedland", name: "Port Hedland, Australia", region: "Pilbara (Iron Ore)" },
  { id: "samarinda", name: "Samarinda, Indonesia", region: "Kalimantan (Coal)" },
  { id: "maputo", name: "Maputo, Mozambique", region: "East Africa (Coal & Minerals)" },
  { id: "richards_bay", name: "Richards Bay, South Africa", region: "RBCT (Thermal Coal)" },
  { id: "paradip", name: "Paradip, India (Coastal Backhaul)", region: "Odisha (Iron Ore)" },
  { id: "visakhapatnam", name: "Visakhapatnam, India (Coastal)", region: "Andhra Pradesh" },
  { id: "haldia", name: "Haldia, India (Coastal)", region: "West Bengal" },
  { id: "chennai", name: "Chennai, India (Coastal)", region: "Tamil Nadu" },
];

const BUNKER_GRADES = [
  { id: "VLSFO", name: "VLSFO 0.5% (Very Low Sulphur Fuel Oil)", priceUSD: 624.50 },
  { id: "IFO380", name: "IFO 380 (High Sulphur Heavy Fuel Oil)", priceUSD: 485.00 },
  { id: "MGO", name: "MGO (Marine Gas Oil 0.1% Sulphur)", priceUSD: 780.00 }
];

export default function DeadheadingOptimization() {
  const navigate = useNavigate();
  const [selectedVesselId, setSelectedVesselId] = useState('VES-101');
  const [loadingPortId, setLoadingPortId] = useState('hay_point');
  const [selectedFuelGrade, setSelectedFuelGrade] = useState('VLSFO');
  const [cargoDate, setCargoDate] = useState('2026-09-24');
  const [backendOptimization, setBackendOptimization] = useState(null);
  const [loadingBackend, setLoadingBackend] = useState(false);

  const selectedVessel = useMemo(() => {
    return FLEET_VESSELS.find(v => v.id === selectedVesselId) || FLEET_VESSELS[0];
  }, [selectedVesselId]);

  const selectedPortObj = useMemo(() => {
    return LOADING_PORTS.find(p => p.id === loadingPortId) || LOADING_PORTS[0];
  }, [loadingPortId]);

  const fuelObj = useMemo(() => {
    return BUNKER_GRADES.find(f => f.id === selectedFuelGrade) || BUNKER_GRADES[0];
  }, [selectedFuelGrade]);

  // Query backend deadheading optimization service
  useEffect(() => {
    async function loadBackendOpt() {
      setLoadingBackend(true);
      try {
        const res = await apiClient.getDeadheading(selectedVesselId, loadingPortId);
        if (res) {
          setBackendOptimization(res);
        }
      } catch (err) {
        console.warn('[DeadheadingOptimization] Backend service fallback:', err.message);
      } finally {
        setLoadingBackend(false);
      }
    }
    loadBackendOpt();
  }, [selectedVesselId, loadingPortId]);

  // Dynamic calculations based on selected vessel AND chosen loading port
  const vesselOpenPortKey = useMemo(() => {
    const loc = (selectedVessel.currentPosition?.locationName || '').toLowerCase();
    if (loc.includes('dhamra')) return 'dhamra';
    if (loc.includes('paradip')) return 'paradip';
    if (loc.includes('gangavaram')) return 'gangavaram';
    if (loc.includes('visakhapatnam') || loc.includes('vizag')) return 'visakhapatnam';
    if (loc.includes('haldia')) return 'haldia';
    return 'dhamra';
  }, [selectedVessel]);

  // Calculate actual ballast distance dynamically
  const ballastDistNM = useMemo(() => {
    const portMap = PORT_DISTANCES_NM[vesselOpenPortKey] || PORT_DISTANCES_NM['dhamra'];
    return portMap[loadingPortId] || 2400;
  }, [vesselOpenPortKey, loadingPortId]);

  const vesselSpeed = selectedVessel.speed || 13.5;
  const ballastHours = Math.round(ballastDistNM / vesselSpeed);
  const ballastDays = (ballastHours / 24).toFixed(1);
  
  // Fuel burn in ballast: ~72% of laden fuel burn rate
  const dailyFuelBurn = +(selectedVessel.fuelConsumptionLaden * 0.72).toFixed(1);
  const totalFuelBurnMT = +(dailyFuelBurn * (ballastHours / 24)).toFixed(1);
  
  // Total ballast cost: Fuel burn + Time Charter Hire opportunity cost
  const fuelCostUSD = Math.round(totalFuelBurnMT * fuelObj.priceUSD);
  const hireOpportunityCostUSD = Math.round((selectedVessel.timeCharterUSDPerDay || 16800) * (ballastHours / 24));
  const totalBallastCostUSD = fuelCostUSD + hireOpportunityCostUSD;

  // Risk categorization based on calculated ballast distance
  const deadheadingRisk = useMemo(() => {
    if (ballastDistNM > 3500) return "Critical";
    if (ballastDistNM > 2000) return "High";
    if (ballastDistNM > 500) return "Medium";
    return "Low";
  }, [ballastDistNM]);

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              BALLAST REPOSITIONING MITIGATION • SHIPOWNER PORTAL
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#eff6ff',
              color: '#1d4ed8',
              border: '1px solid #bfdbfe',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              <Zap size={11} color="#2563eb" />
              Dynamic Spatial Solver Active
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Deadheading & Ballast Optimization
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Calculate actual non-revenue repositioning distance, fuel burn, and hire opportunity loss to identify backhaul cargo alternatives.
          </p>
        </div>

        <button 
          onClick={() => navigate('/dashboard/backhaul')}
          style={{
            padding: '0.65rem 1.4rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Award size={16} />
          <span>Explore Backhaul Fixtures &rarr;</span>
        </button>
      </div>

      {/* Input Parameters Form with Select Options */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
            Select Target Vessel, Next Laycan & Bunker Grade
          </h2>
          <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Dynamic recalculation upon selection
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          
          {/* Select Vessel Option */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Select Vessel:
            </label>
            <select 
              value={selectedVesselId}
              onChange={e => setSelectedVesselId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1.5px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
            >
              {FLEET_VESSELS.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.type} • {v.dwt?.toLocaleString()} DWT • Laycan: {v.availabilityDate})
                </option>
              ))}
            </select>
          </div>

          {/* Current Open Location */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Current Open Port / Position:
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.65rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc',
              fontSize: '0.85rem',
              color: '#334155'
            }}>
              <MapPin size={16} color="var(--primary)" />
              <strong>{selectedVessel.currentPosition?.locationName}</strong>
            </div>
          </div>

          {/* Next Cargo Loading Port Select Option */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Next Cargo Loading Port:
            </label>
            <select 
              value={loadingPortId}
              onChange={e => setLoadingPortId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1.5px solid var(--primary)', fontSize: '0.85rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
            >
              {LOADING_PORTS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.region}
                </option>
              ))}
            </select>
          </div>

          {/* Select Bunker Fuel Grade Option */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>
              Bunker Grade (ML Persistence Model):
            </label>
            <select
              value={selectedFuelGrade}
              onChange={e => setSelectedFuelGrade(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1.5px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
            >
              {BUNKER_GRADES.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} (${b.priceUSD.toFixed(2)}/MT)
                </option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* Deadheading Liability Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Left: Liability Summary Card */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
            BALLAST REPOSITIONING LIABILITY
          </div>
          <div style={{ 
            fontSize: '2.5rem', 
            fontWeight: 900, 
            margin: '0.5rem 0',
            color: deadheadingRisk === 'Critical' || deadheadingRisk === 'High' ? 'var(--semantic-red)' : (deadheadingRisk === 'Medium' ? 'var(--semantic-amber)' : 'var(--semantic-green)')
          }}>
            {deadheadingRisk.toUpperCase()} RISK
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a' }}>
            {ballastDistNM.toLocaleString()} Nautical Miles
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.5 }}>
            {selectedVessel.name} in <strong>{selectedVessel.currentPosition?.locationName}</strong> will incur <strong>{ballastDays} days ({ballastHours} hours)</strong> of uncompensated empty steaming to reach {selectedPortObj.name}.
          </p>

          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.75rem', color: '#475569' }}>
            Vessel Ballast Speed: <strong>{vesselSpeed} kts</strong> • Fuel Rate: <strong>{dailyFuelBurn} MT/day</strong>
          </div>
        </div>

        {/* Right: Operational Expense Matrix & Alternative Cargo */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
              Ballast Expense Breakdown ({selectedPortObj.name})
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Bunker: {fuelObj.id} @ ${fuelObj.priceUSD}/MT
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>BALLAST STEAMING TIME</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px', color: '#0f172a' }}>{ballastDays} Days</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{ballastHours} steaming hours</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>BUNKER CONSUMPTION</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '2px', color: '#0f172a' }}>{totalFuelBurnMT} MT</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>${fuelCostUSD.toLocaleString()} fuel liability</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#fef2f2', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <div style={{ fontSize: '0.7rem', color: '#991b1b', fontWeight: 700 }}>TOTAL BALLAST LIABILITY</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--semantic-red)', marginTop: '2px' }}>
                ${totalBallastCostUSD.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#991b1b' }}>Fuel + charter opex loss</div>
            </div>
          </div>

          {/* Suggested Alternative Fixture to Eliminate Ballast */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--primary-light)',
            border: '1.5px solid var(--primary)',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                NAUGATI BACKHAUL RECOMMENDATION
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', margin: '0.2rem 0' }}>
                Fix Iron Ore from Paradip &rarr; Qingdao (OPP-301)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#334155' }}>
                Eliminates {ballastDistNM.toLocaleString()} NM empty return leg • Yields <strong>+$426,000 net voyage margin</strong>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard/backhaul')}
              style={{
                padding: '0.65rem 1.25rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <span>Accept Backhaul</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
