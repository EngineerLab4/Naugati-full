import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Shield, Anchor, Ship, 
  MapPin, Gauge, Fuel, Award, Navigation, Calendar 
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { vesselService } from '../../services/vesselService';
import { portService } from '../../services/portService';
import { useShipment } from '../../context/ShipmentContext';

export default function VesselDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { shipment, updateShipment, activePort } = useShipment();

  const [vessel, setVessel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await vesselService.getVesselById(id || 'VES-101');
      setVessel(res.vessel);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading || !vessel) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Loading vessel telematics...</div>;
  }

  const compatibility = portService.checkCompatibility(vessel, activePort);

  // Historical speed & fuel consumption performance
  const performanceHistory = [
    { voyage: 'Leg 1', speedKts: 13.8, fuelMT: 32.5 },
    { voyage: 'Leg 2', speedKts: 14.1, fuelMT: 33.2 },
    { voyage: 'Leg 3', speedKts: 13.5, fuelMT: 31.8 },
    { voyage: 'Leg 4', speedKts: 13.9, fuelMT: 33.0 },
    { voyage: 'Leg 5', speedKts: 14.0, fuelMT: 33.5 },
  ];

  return (
    <div>
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.4rem', 
          marginBottom: '1.5rem', 
          border: 'none', 
          background: 'transparent', 
          padding: 0,
          color: '#64748b',
          fontWeight: 600,
          fontSize: '0.85rem',
          cursor: 'pointer'
        }}
      >
        <ArrowLeft size={16} /> Back to Options
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.2rem' }}>{vessel.name}</h1>
            <span style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: 600 }}>
              IMO {vessel.imo}
            </span>
          </div>
          <div style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {vessel.type} Class • <strong>{vessel.dwt.toLocaleString()} MT DWT</strong> • Built {vessel.built} • Flag: {vessel.flag} • Owner: {vessel.owner}
          </div>
        </div>

        <button 
          onClick={() => {
            updateShipment({ preferredVesselType: vessel.type });
            navigate('/dashboard/final-recommendation');
          }}
          style={{
            padding: '0.75rem 1.75rem',
            backgroundColor: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          Select for Charter Fixture
        </button>
      </div>

      {/* Grid: Specifications & Port Compatibility (Left) + NAUGATI Score & Reasoning (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '1.75rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Specifications Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Vessel Specifications & Telematics
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DEADWEIGHT (DWT)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{vessel.dwt.toLocaleString()} MT</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>DESIGN LADEN DRAFT</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>{vessel.draft} m</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>LENGTH OVERALL (LOA)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{vessel.loa} m</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>BEAM (WIDTH)</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{vessel.beam} m</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>SERVICE SPEED</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{vessel.speed} kts</div>
              </div>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>FUEL CONSUMPTION</div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{vessel.fuelConsumptionLaden} MT/day</div>
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '2rem', fontSize: '0.8rem', color: '#475569' }}>
              <div>Current Position: <strong>{vessel.currentPosition.locationName}</strong></div>
              <div>Next Port: <strong>{vessel.nextPort}</strong> ({vessel.eta})</div>
              <div>Available Date: <strong style={{ color: 'var(--primary)' }}>{vessel.availabilityDate}</strong></div>
            </div>
          </div>

          {/* Port Compatibility Assessment */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Discharge Port Compatibility: {activePort.name}
              </h3>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: compatibility.verdict === 'Compatible' ? 'var(--semantic-green-light)' : 'var(--semantic-amber-light)',
                color: compatibility.verdict === 'Compatible' ? 'var(--semantic-green)' : 'var(--semantic-amber)'
              }}>
                {compatibility.verdict}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {compatibility.constraints.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{c.criterion}:</span> {c.vesselValue} &le; {c.portLimit}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: c.pass ? 'var(--semantic-green)' : 'var(--semantic-red)', fontWeight: 700 }}>
                    {c.pass ? <CheckCircle size={16} /> : <Anchor size={16} />}
                    <span>{c.margin} Safe UKC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speed & Fuel Performance Graph */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1rem 0' }}>
              Historical Voyage Speed & Fuel Burn Profile
            </h3>
            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="voyage" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip />
                  <Line type="monotone" dataKey="speedKts" stroke="#04ADDE" strokeWidth={2.5} name="Speed (kts)" />
                  <Line type="monotone" dataKey="fuelMT" stroke="#f59e0b" strokeWidth={2} name="Fuel Burn (MT/d)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right: Decision Score & Explainability */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card" style={{ padding: '1.75rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
            <div style={{ textAlign: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid rgba(4, 173, 222, 0.2)', marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em' }}>NAUGATI MATCH SCORE</div>
              <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, margin: '0.4rem 0' }}>
                {vessel.matchScore || 94}<span style={{ fontSize: '1.5rem', opacity: 0.5 }}>/100</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#0f172a', fontWeight: 600 }}>High Operational Compatibility</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Stowage Capacity Match:</span>
                <span style={{ fontWeight: 700 }}>{vessel.capacityUtilization || 98}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Port Permissible Draft UKC:</span>
                <span style={{ fontWeight: 700, color: 'var(--semantic-green)' }}>+{(activePort.maxDraft - vessel.draft).toFixed(1)} m</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Ballast Deadheading Miles:</span>
                <span style={{ fontWeight: 700 }}>{vessel.deadheadingDistanceNM} NM</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Fuel Efficiency Score:</span>
                <span style={{ fontWeight: 700 }}>{vessel.efficiencyScore}/100</span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid rgba(4, 173, 222, 0.2)', paddingTop: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                WHY NAUGATI RECOMMENDS THIS VESSEL:
              </div>
              <p style={{ fontSize: '0.8rem', color: '#0f172a', lineHeight: 1.5, margin: 0 }}>
                {vessel.recommendationReason}
              </p>
            </div>
          </div>

          {/* Deadheading Optimization Notice */}
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.3rem' }}>REPOSITIONING ECONOMICS</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>${vessel.deadheadingCostUSD.toLocaleString()} USD</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
              Estimated ballast repositioning expense to loading berth.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
