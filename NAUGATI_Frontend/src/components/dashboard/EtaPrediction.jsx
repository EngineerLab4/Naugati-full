import React from 'react';
import { 
  Navigation, AlertTriangle, CloudRain, ShieldCheck, 
  Anchor, Clock, CheckCircle2, Activity, ArrowRight 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import LockedGate from './LockedGate';

export default function EtaPrediction() {
  const { shipment, activePort, activeOrigin, analysisResult, hasExecuted } = useShipment();

  // Lock gate — only show real ETA after ML pipeline has computed it
  if (!hasExecuted || !analysisResult) {
    return <LockedGate pageName="ETA Prediction" />;
  }

  const eta = analysisResult?.eta || {};

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            VOYAGE TIMELINE & DISRUPTION FORECASTING
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            ETA Prediction & Passage Progress
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Predictive transit scheduling from <strong>{activeOrigin.name}</strong> to <strong>{activePort.name}</strong> incorporating anchorage congestion and sea-state swells.
          </p>
        </div>
      </div>

      {/* Primary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>OCEAN PILOT ARRIVAL</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: '#0f172a' }}>
            {eta.estimatedOceanArrival}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
            Pilot Station Clearance Target
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>ESTIMATED BERTHING</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: '#10b981' }}>
            {eta.estimatedBerthing}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Queue: {activePort.averageWaitingTimeDays} days ({activePort.currentCongestion})
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--semantic-amber)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>DELAY PROBABILITY</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--semantic-amber)' }}>
            {eta.delayProbability}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Expected variance: <strong>&plusmn;{eta.expectedDelayDays} days</strong>
          </div>
        </div>

        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid #0f172a' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>DISCHARGE COMPLETED</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem' }}>
            {eta.estimatedCompletion}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Rate: {(activePort.handlingRate / 1000).toFixed(0)}k MT/day
          </div>
        </div>

      </div>

      {/* Grid: Voyage Milestones Sequence & Delay Impact Factors */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Timeline Sequence */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1.5rem 0' }}>
            Voyage Passage Milestones Sequence
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', paddingLeft: '1.5rem' }}>
            {/* Timeline line */}
            <div style={{ position: 'absolute', left: '26px', top: '15px', bottom: '15px', width: '2px', backgroundColor: '#e2e8f0', zIndex: 0 }} />

            {eta.milestones.map((m, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', position: 'relative', zIndex: 1 }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: m.status === 'completed' ? 'var(--semantic-green)' : (idx === 1 ? 'var(--primary)' : 'white'),
                  border: `2px solid ${m.status === 'completed' ? 'var(--semantic-green)' : (idx === 1 ? 'var(--primary)' : '#cbd5e1')}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: m.status === 'completed' ? 'white' : (idx === 1 ? 'white' : '#64748b'),
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {m.status === 'completed' ? '✓' : idx + 1}
                </div>

                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '0.85rem 1.2rem', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{m.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {idx === 0 ? "Departs loading terminal" : (idx === 4 ? "Final delivery to receivers" : "Navigational milestone")}
                    </div>
                  </div>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: idx === 1 ? 'var(--primary)' : '#0f172a' }}>
                    {m.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Delay Impact Drivers */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1.25rem 0' }}>
              ETA Disruption Risk Factors
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {eta.primaryDelayFactors.map((f, i) => (
                <div key={i} style={{ padding: '1rem', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{f.factor}</div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--semantic-amber)' }}>{f.impact}</span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
                    Monitored dynamically through Port Authority berth telematics and NOAA sea-state feeds.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: '8px', border: '1px solid rgba(4,173,222,0.2)', marginTop: '1.5rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>ETA CONFIDENCE VERDICT</div>
            <p style={{ fontSize: '0.82rem', color: '#0f172a', margin: '0.3rem 0 0', lineHeight: 1.4 }}>
              Confidence is rated <strong>High</strong> because the chosen route passes deep-water Sunda Strait rather than congested Singapore anchorages, with calm neap-tide berthing at {activePort.name}.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
