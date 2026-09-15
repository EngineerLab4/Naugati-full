import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ship, TrendingUp, Anchor, Navigation, 
  AlertTriangle, ShieldAlert, Award, ArrowRight, 
  DollarSign, Activity, Clock, CheckCircle2, Sparkles, Play
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useShipment } from '../../context/ShipmentContext';
import ShipownerDashboard from './ShipownerDashboard';
import WorkflowAnimation from '../landing/WorkflowAnimation';
import { MARITIME_ALERTS } from '../../services/demoData';

export default function UserDashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const { shipment, activePort, activeOrigin, analysisResult } = useShipment();

  // Role routing check: if Ocean Carrier, render Shipowner Dashboard
  const isShipowner = userProfile?.organizationType === 'Ocean Carrier' || userProfile?.role === 'shipowner';
  if (isShipowner) {
    return <ShipownerDashboard />;
  }

  const currentFreight = analysisResult?.freight?.currentFreightUSDPerMT || 31.40;
  const forecast14D = analysisResult?.freight?.forecast14D || 33.15;
  const marketAction = analysisResult?.freight?.marketAction || "BOOK NOW";
  const chosenVessel = analysisResult?.chosenVessel;
  const eta = analysisResult?.eta;
  const overallScore = analysisResult?.naugatiOverallScore || 92;

  return (
    <div>
      {/* Welcome & Active Shipment Intake Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
            <span style={{ 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary)', 
              fontSize: '0.72rem', 
              fontWeight: 700, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '4px' 
            }}>
              INTELLIGENT CHARTERING WORKSPACE
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>DEMO DATA • Live Simulation</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Welcome back, {userProfile?.firstName || 'Charterer'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Active Voyage Evaluation: <strong>{shipment.cargoQuantity.toLocaleString()} MT {shipment.cargoType}</strong> from <strong>{activeOrigin.name}</strong> to <strong>{activePort.name}</strong>.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/dashboard/cargo')}
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
              gap: '0.5rem',
              boxShadow: '0 4px 10px rgba(4, 173, 222, 0.25)'
            }}
          >
            <span>Change Shipment Inputs</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Primary KPI Ribbon (Section 12 specification) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Freight & Forecast */}
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>CURRENT FREIGHT (VOYAGE)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.3rem 0 0.1rem' }}>
            ${currentFreight.toFixed(2)} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>/ MT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--semantic-green)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> 14D: ${forecast14D} ({marketAction})
          </div>
        </div>

        {/* Recommended Vessel */}
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid #0f172a' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>RECOMMENDED VESSEL</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--primary)' }}>
            {chosenVessel?.name || "MV Ocean Splendor"}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {chosenVessel?.type || "Panamax"} • Match: {chosenVessel?.matchScore || 96}/100
          </div>
        </div>

        {/* Port Congestion */}
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid var(--semantic-amber)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>{activePort.name.toUpperCase()} QUEUE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.3rem 0 0.1rem', color: activePort.currentCongestion === 'High' ? 'var(--semantic-red)' : 'var(--semantic-amber)' }}>
            {activePort.averageWaitingTimeDays} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Days</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {activePort.waitingVessels} Vessels queued at anchorage
          </div>
        </div>

        {/* Passage ETA & Score */}
        <div className="card" style={{ padding: '1.25rem', borderTop: '4px solid var(--semantic-green)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>VOYAGE TRANSIT ETA</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.4rem 0 0.2rem' }}>
            {eta?.estimatedOceanArrival || "18 Sept, 14:30"}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--semantic-green)', fontWeight: 600 }}>
            NAUGATI Score: <strong>{overallScore}/100</strong>
          </div>
        </div>

      </div>

      {/* Main Grid: Active Strategy Recommendation Card & Real-Time Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '1.75rem', marginBottom: '2rem' }}>
        
        {/* Left: Active Recommendation Spotlight Card */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#ffffff' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={22} color="var(--primary)" />
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
                  Recommended Shipping Strategy
                </h2>
              </div>
              <span style={{
                padding: '0.2rem 0.6rem',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 800,
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)'
              }}>
                SCORE: {overallScore}/100
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              For your <strong>{shipment.cargoQuantity.toLocaleString()} MT {shipment.cargoType}</strong> shipment, NAUGATI recommends chartering <strong>{chosenVessel?.name} ({chosenVessel?.type})</strong> via <strong>Sunda Strait Direct</strong> under a <strong>Short-Term Multiple-Voyage Contract</strong>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>VOYAGE OUTLAY</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>${currentFreight}/MT</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>TRANSIT TIME</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>12.3 Days</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>ROUTE RISK</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--semantic-green)' }}>Low-Med</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => navigate('/dashboard/final-recommendation')}
              style={{
                flex: 1,
                padding: '0.75rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>View Full Master Recommendation</span>
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => navigate('/dashboard/route-optimization')}
              style={{
                padding: '0.75rem 1.25rem',
                backgroundColor: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Track on Map
            </button>
          </div>
        </div>

        {/* Right: Real-time Maritime Advisories */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>Critical Maritime Advisories</h3>
              <span 
                onClick={() => navigate('/dashboard/alerts')}
                style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}
              >
                View All &rarr;
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {MARITIME_ALERTS.slice(0, 3).map(alt => (
                <div 
                  key={alt.id}
                  onClick={() => navigate('/dashboard/alerts')}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '6px',
                    border: '1px solid #f1f5f9',
                    backgroundColor: '#f8fafc',
                    cursor: 'pointer'
                  }}
                  className="hover:border-primary"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <div style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: alt.severity === 'critical' ? 'var(--semantic-red)' : 'var(--semantic-amber)'
                    }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0f172a' }}>{alt.title}</span>
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.4 }}>
                    {alt.description.slice(0, 95)}...
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Live Baltic & AIS Feed Synchronized</span>
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>15m Refresh</span>
          </div>
        </div>

      </div>

      {/* --- LIVE WORKFLOW & FREIGHT RATE PREDICTION SIMULATOR --- */}
      <div style={{ marginTop: '3rem', marginBottom: '2rem' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.35rem' }}>
              <Sparkles size={14} /> LIVE MARITIME INTELLIGENCE SIMULATOR
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Watch How AI Calculates Rates & Optimizes Routes
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '0.25rem 0 0' }}>
              Test and simulate live forward rate predictions, carrier rankings, and deep-water shortcut routing.
            </p>
          </div>
          <button 
            onClick={() => navigate('/dashboard/cargo')}
            style={{
              padding: '0.6rem 1.25rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              boxShadow: '0 4px 12px rgba(4, 173, 222, 0.25)'
            }}
          >
            <span>Run New Shipment Analysis</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div style={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.1)' }}>
          <WorkflowAnimation />
        </div>
      </div>
    </div>
  );
}
