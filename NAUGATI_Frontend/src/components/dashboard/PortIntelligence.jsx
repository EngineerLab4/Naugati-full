import React, { useState, useEffect } from 'react';
import { 
  Anchor, MapPin, AlertTriangle, CheckCircle, 
  Clock, Ship, ShieldCheck, Activity, Search, ChevronRight,
  Cpu, Radio, Zap
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PORTS, FLEET_VESSELS } from '../../services/demoData';
import { portService } from '../../services/portService';
import { useShipment } from '../../context/ShipmentContext';

export default function PortIntelligence() {
  const { shipment, updateShipment } = useShipment();
  const [selectedPortId, setSelectedPortId] = useState(shipment.destinationPortId || 'dhamra');
  const [selectedVesselId, setSelectedVesselId] = useState('VES-101'); // MV Ocean Splendor
  const [searchQuery, setSearchQuery] = useState('');
  const [congestionPred, setCongestionPred] = useState(null);

  useEffect(() => {
    if (shipment.destinationPortId && shipment.destinationPortId !== selectedPortId) {
      setSelectedPortId(shipment.destinationPortId);
    }
  }, [shipment.destinationPortId]);

  const selectedPort = PORTS.find(p => p.id === selectedPortId) || PORTS[0];
  const selectedVessel = FLEET_VESSELS.find(v => v.id === selectedVesselId) || FLEET_VESSELS[0];

  useEffect(() => {
    async function loadCongestion() {
      const pred = await portService.getPortCongestionPrediction(selectedPort.name);
      setCongestionPred(pred);
    }
    loadCongestion();
  }, [selectedPort.name]);

  // Rule-based compatibility calculation
  const compatibility = portService.checkCompatibility(selectedVessel, selectedPort);

  const filteredPorts = PORTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.unlocode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
              PORT INFRASTRUCTURE & CONGESTION
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>7 PRIMARY BULK TERMINALS</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            East Coast India Port Intelligence
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Rule-based draft engineering, berthing constraints, historical queues, and terminal telematics.
          </p>
        </div>

        <button 
          onClick={() => {
            updateShipment({ destination: selectedPort.name, destinationPortId: selectedPort.id });
          }}
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
          <Anchor size={16} />
          <span>Set as Active Discharge Port</span>
        </button>
      </div>

      {/* Main Grid: Port Selector List (Left) + Detailed Port Specs & Rule Engine (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2.5fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left: Port Selection List */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem' }}>SELECT DESTINATION PORT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f8fafc', padding: '0.45rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <Search size={15} color="#64748b" />
              <input 
                type="text" 
                placeholder="Filter port name or UN/LOCODE..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.82rem', width: '100%', fontFamily: 'Poppins' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '560px', overflowY: 'auto' }}>
            {filteredPorts.map(p => {
              const isSelected = p.id === selectedPortId;
              const isHighCongestion = p.currentCongestion === 'High';

              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedPortId(p.id)}
                  style={{
                    padding: '0.9rem',
                    borderRadius: '8px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:border-primary"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? 'var(--primary)' : '#0f172a' }}>
                      {p.name}
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      backgroundColor: isHighCongestion ? 'var(--semantic-red-light)' : (p.currentCongestion === 'Medium' ? 'var(--semantic-amber-light)' : 'var(--semantic-green-light)'),
                      color: isHighCongestion ? 'var(--semantic-red)' : (p.currentCongestion === 'Medium' ? 'var(--semantic-amber)' : 'var(--semantic-green)')
                    }}>
                      {p.currentCongestion}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                    <span>Max Draft: <strong>{p.maxDraft}m</strong></span>
                    <span>Wait: <strong>{p.averageWaitingTimeDays}d</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Port Telematics, Constraints, & Compatibility Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Selected Port Profile Card */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Anchor size={22} color="var(--primary)" />
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>{selectedPort.name}</h2>
                  <span style={{ fontSize: '0.78rem', fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {selectedPort.unlocode}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.3rem' }}>
                  {selectedPort.type} • Authority: <strong>{selectedPort.authority}</strong> • {selectedPort.state}, India
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', marginBottom: '0.35rem' }}>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: '#e0f2fe',
                    color: '#0369a1',
                    border: '1px solid #bae6fd'
                  }}>
                    <Cpu size={11} />
                    {congestionPred?.model_version || 'port_congestion_v1'}
                  </span>
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    backgroundColor: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0'
                  }}>
                    <Radio size={11} />
                    Live AIS Stream
                  </span>
                </div>

                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  backgroundColor: (congestionPred?.congestion_level || selectedPort.currentCongestion) === 'High' || (congestionPred?.congestion_level || selectedPort.currentCongestion) === 'Severe' ? 'var(--semantic-red-light)' : 'var(--semantic-green-light)',
                  color: (congestionPred?.congestion_level || selectedPort.currentCongestion) === 'High' || (congestionPred?.congestion_level || selectedPort.currentCongestion) === 'Severe' ? 'var(--semantic-red)' : 'var(--semantic-green)'
                }}>
                  ML: {congestionPred?.congestion_level || selectedPort.currentCongestion} Congestion ({congestionPred?.vessels_in_queue ?? selectedPort.waitingVessels} in queue)
                </span>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                  ML Predicted Wait: <strong>{congestionPred?.average_waiting_hours ? `${congestionPred.average_waiting_hours}h (${congestionPred.average_waiting_days}d)` : `${selectedPort.averageTurnaroundHours} Hours`}</strong>
                </div>
              </div>
            </div>

            {/* Dimensional Infrastructure Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', backgroundColor: '#f8fafc', padding: '1.25rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>MAX DRAFT</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{selectedPort.maxDraft} m</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Deep-water channel</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>MAX LOA</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedPort.maxLOA} m</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Length overall limit</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>MAX BEAM</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{selectedPort.maxBeam} m</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Crane outreach limit</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>UNLOAD RATE</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800 }}>{(selectedPort.handlingRate / 1000).toFixed(0)}k <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>MT/d</span></div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Mechanized conveyor</div>
              </div>
            </div>

            {/* Live ML Prediction & Telemetry Advisory */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {congestionPred?.delay_risk && (
                <div style={{ fontSize: '0.82rem', color: '#0369a1', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', padding: '0.75rem 1rem', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Zap size={16} color="#0284c7" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>AI Congestion Forecast:</strong> {congestionPred.delay_risk}
                    <span style={{ marginLeft: '0.5rem', fontSize: '0.74rem', color: '#0284c7', opacity: 0.9 }}>
                      (Dual Random Forest • {Math.round((congestionPred.confidence || 0.85) * 100)}% Confidence • Score: {congestionPred.congestion_score}/100)
                    </span>
                  </div>
                </div>
              )}

              {/* Navigation Restrictions */}
              <div style={{ fontSize: '0.8rem', color: '#475569', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '0.75rem 1rem', borderRadius: '6px' }}>
                <strong>Port Infrastructure Advisory:</strong> {selectedPort.restrictions}
              </div>
            </div>
          </div>

          {/* RULE-BASED VESSEL-PORT COMPATIBILITY ENGINE */}
          <div className="card" style={{ padding: '1.75rem', border: `2px solid ${compatibility.verdict === 'Compatible' ? 'var(--semantic-green)' : (compatibility.verdict === 'Conditionally Compatible' ? 'var(--semantic-amber)' : 'var(--semantic-red)')}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
                  RULE-BASED CONSTRAINT ENGINE (SECTION 30 SPEC)
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.2rem 0' }}>
                  Port Compatibility Verdict: <span style={{ color: compatibility.verdict === 'Compatible' ? 'var(--semantic-green)' : 'var(--semantic-red)' }}>{compatibility.verdict}</span>
                </h3>
              </div>

              {/* Vessel Selector Dropdown for Compatibility Testing */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Test Vessel:</span>
                <select 
                  value={selectedVesselId}
                  onChange={e => setSelectedVesselId(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins' }}
                >
                  {FLEET_VESSELS.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type}, Draft: {v.draft}m)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Mathematical Constraint Checklist */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.25rem' }}>
              {compatibility.constraints.map((c, i) => (
                <div key={i} style={{ padding: '0.85rem', borderRadius: '6px', backgroundColor: c.pass ? '#f0fdf4' : '#fef2f2', border: `1px solid ${c.pass ? '#bbf7d0' : '#fecaca'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: c.pass ? '#15803d' : '#b91c1c' }}>{c.criterion}</span>
                    {c.pass ? <CheckCircle size={15} color="#15803d" /> : <AlertTriangle size={15} color="#b91c1c" />}
                  </div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, marginTop: '4px' }}>
                    {c.vesselValue} &le; {c.portLimit}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                    Clearance Margin: <strong>{c.margin}</strong>
                  </div>
                </div>
              ))}
            </div>

            {/* Explainable Decision Text */}
            <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.5 }}>
              {compatibility.reasons.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>&bull;</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Historical Congestion & Waiting Time Recharts Graph */}
      <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
              {selectedPort.name} • 7-Day Congestion & Waiting History
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0' }}>
              Average waiting days at anchorage vs queued dry bulk vessels.
            </p>
          </div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
            Daily Berth Telematics Feed
          </div>
        </div>

        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={selectedPort.congestionHistory} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} unit="d" />
              <Tooltip formatter={(val, name) => [name === 'waitingDays' ? `${val} days` : `${val} vessels`, name === 'waitingDays' ? 'Avg Waiting Time' : 'Waiting Vessels']} />
              <Line type="monotone" dataKey="waitingDays" stroke="#04ADDE" strokeWidth={3} dot={{ r: 4 }} name="Waiting Days" />
              <Line type="monotone" dataKey="vessels" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} name="Queued Vessels" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
