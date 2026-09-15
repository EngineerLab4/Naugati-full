import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crosshair, AlertCircle, ArrowRight, Ship, 
  Fuel, Clock, DollarSign, CheckCircle2, Award 
} from 'lucide-react';
import { FLEET_VESSELS, BACKHAUL_OPPORTUNITIES } from '../../services/demoData';

export default function DeadheadingOptimization() {
  const navigate = useNavigate();
  const [selectedVesselId, setSelectedVesselId] = useState('VES-101');
  const [loadingPort, setLoadingPort] = useState('Hay Point, Australia');
  const [cargoDate, setCargoDate] = useState('2026-09-24');

  const selectedVessel = FLEET_VESSELS.find(v => v.id === selectedVesselId) || FLEET_VESSELS[0];

  // Dynamic calculations based on vessel position
  const ballastDistNM = selectedVessel.deadheadingDistanceNM;
  const ballastHours = Math.round(ballastDistNM / selectedVessel.speed);
  const ballastDays = (ballastHours / 24).toFixed(1);
  const fuelBurnMT = +((selectedVessel.fuelConsumptionLaden * 0.75) * (ballastHours / 24)).toFixed(1);
  const ballastCostUSD = Math.round(fuelBurnMT * 624.50 + (selectedVessel.timeCharterUSDPerDay * (ballastHours / 24)));

  let deadheadingRisk = "Low";
  if (ballastDistNM > 300) deadheadingRisk = "High";
  else if (ballastDistNM > 120) deadheadingRisk = "Medium";

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            BALLAST VOYAGE MITIGATION • SHIPOWNER PORTAL
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Deadheading Optimization
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Calculate non-revenue repositioning distance, ballast bunker burn, and identify nearby cargo to minimize uncompensated steaming.
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
          <span>Explore Backhaul Matches</span>
        </button>
      </div>

      {/* Input Parameters Form */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Select Target Vessel & Fixture Laycan</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
              Select Vessel:
            </label>
            <select 
              value={selectedVesselId}
              onChange={e => setSelectedVesselId(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins' }}
            >
              {FLEET_VESSELS.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.type}, Open: {v.availabilityDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
              Current Open Location:
            </label>
            <input 
              type="text" 
              disabled 
              value={selectedVessel.currentPosition.locationName}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', fontSize: '0.85rem', fontFamily: 'Poppins', color: '#64748b' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
              Next Cargo Loading Port:
            </label>
            <select 
              value={loadingPort}
              onChange={e => setLoadingPort(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins' }}
            >
              <option value="Hay Point, Australia">Hay Point, Australia</option>
              <option value="Samarinda, Indonesia">Samarinda, Indonesia</option>
              <option value="Maputo, Mozambique">Maputo, Mozambique</option>
              <option value="Paradip, India">Paradip, India (Backhaul Iron Ore)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.4rem' }}>
              Cargo Availability Laycan:
            </label>
            <input 
              type="date"
              value={cargoDate}
              onChange={e => setCargoDate(e.target.value)}
              style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins' }}
            />
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
            color: deadheadingRisk === 'High' ? 'var(--semantic-red)' : (deadheadingRisk === 'Medium' ? 'var(--semantic-amber)' : 'var(--semantic-green)')
          }}>
            {deadheadingRisk} RISK
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
            {ballastDistNM} Nautical Miles
          </div>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.75rem', lineHeight: 1.5 }}>
            {selectedVessel.name} in <strong>{selectedVessel.currentPosition.locationName.split('(')[0]}</strong> will incur <strong>{ballastDays} days</strong> of uncompensated empty steaming to reach {loadingPort}.
          </p>
        </div>

        {/* Right: Operational Expense Matrix & Alternative Cargo */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
            Ballast Expense Breakdown & Savings Opportunity
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>BALLAST TIME</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>{ballastHours} Hours</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>~{ballastDays} steaming days</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>BUNKER CONSUMPTION</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: '2px' }}>{fuelBurnMT} MT</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>VLSFO at $624.50/MT</div>
            </div>

            <div style={{ padding: '0.85rem', backgroundColor: '#f8fafc', borderRadius: '6px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>TOTAL BALLAST COST</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--semantic-red)', marginTop: '2px' }}>
                ${ballastCostUSD.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Fuel + charter opex</div>
            </div>
          </div>

          {/* Suggested Alternative Fixture */}
          <div style={{
            padding: '1.25rem',
            backgroundColor: 'var(--primary-light)',
            border: '1px solid rgba(4, 173, 222, 0.3)',
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
              <div style={{ fontWeight: 800, fontSize: '0.95rem', margin: '0.2rem 0' }}>
                Fix Iron Ore from Dhamra &rarr; Qingdao (OPP-301)
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                Eliminates 3,480 NM empty return leg • Yields <strong>+$426,000 net margin</strong>
              </div>
            </div>

            <button 
              onClick={() => navigate('/dashboard/backhaul')}
              style={{
                padding: '0.6rem 1.25rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.82rem',
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
