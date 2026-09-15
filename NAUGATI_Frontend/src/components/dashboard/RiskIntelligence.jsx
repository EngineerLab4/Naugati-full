import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, CloudRain, Anchor, ShieldAlert, 
  Clock, DollarSign, Activity, CheckCircle, ArrowRight 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { riskService } from '../../services/riskService';

export default function RiskIntelligence() {
  const navigate = useNavigate();
  const { shipment, activePort, activeOrigin } = useShipment();
  const [riskData, setRiskData] = useState(null);

  useEffect(() => {
    async function load() {
      const res = await riskService.getRiskAssessment({
        portId: shipment.destinationPortId,
        vesselType: shipment.preferredVesselType || 'Panamax',
        origin: shipment.origin
      });
      setRiskData(res);
    }
    load();
  }, [shipment.destinationPortId, shipment.preferredVesselType, shipment.origin]);

  if (!riskData) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Compiling multi-source risk indices...</div>;
  }

  const { overallRiskScore, overallRiskVerdict, riskCategories, idleTimeRisk } = riskData;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            MARITIME DISRUPTION & COMPLIANCE INTELLIGENCE
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Risk & Congestion Intelligence
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Active risk monitoring across geopolitical choke points, cyclone tracking, sanction compliance, and port waiting demurrage on <strong>{activeOrigin.name} &rarr; {activePort.name}</strong>.
          </p>
        </div>

        <button 
          onClick={() => navigate('/dashboard/what-if')}
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
          <span>Stress-Test in What-If</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Top Cards: Composite Risk Score & Idle-Time Cost Risk */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Overall Score */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>
            COMPOSITE PASSAGE RISK
          </div>
          <div style={{ 
            fontSize: '3.8rem', 
            fontWeight: 900, 
            lineHeight: 1, 
            margin: '0.5rem 0',
            color: overallRiskScore > 50 ? 'var(--semantic-red)' : (overallRiskScore > 30 ? 'var(--semantic-amber)' : 'var(--semantic-green)')
          }}>
            {overallRiskScore}
            <span style={{ fontSize: '1.2rem', color: '#94a3b8' }}>/100</span>
          </div>

          <div style={{
            display: 'inline-block',
            padding: '0.35rem 1rem',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.85rem',
            backgroundColor: overallRiskScore > 50 ? 'var(--semantic-red-light)' : (overallRiskScore > 30 ? 'var(--semantic-amber-light)' : 'var(--semantic-green-light)'),
            color: overallRiskScore > 50 ? 'var(--semantic-red)' : (overallRiskScore > 30 ? 'var(--semantic-amber)' : 'var(--semantic-green)')
          }}>
            {overallRiskVerdict.toUpperCase()}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.75rem' }}>
            Updated in real-time based on current route
          </div>
        </div>

        {/* Section 34: Idle-Time Risk & Demurrage Liability */}
        <div className="card" style={{ padding: '2rem', borderLeft: '4px solid var(--semantic-amber)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--semantic-amber)', letterSpacing: '0.04em' }}>
                SPEC SECTION 34 • IDLE-TIME RISK
              </span>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0.2rem 0' }}>
                Port Queue & Demurrage Liability: {idleTimeRisk.level} Risk
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--semantic-red)' }}>
                ${idleTimeRisk.potentialIdleCostUSD.toLocaleString()}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Potential Demurrage Exposure</div>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, margin: '0 0 1.25rem' }}>
            {idleTimeRisk.whyReason}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', fontSize: '0.8rem' }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>EXPECTED IDLE TIME</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{idleTimeRisk.expectedIdleDays} Days</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>DAILY CHARTER DEMURRAGE</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>${idleTimeRisk.dailyDemurrageCostUSD.toLocaleString()} / day</div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.72rem' }}>RECOMMENDED ACTION</div>
              <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Schedule Berthing Window</div>
            </div>
          </div>
        </div>

      </div>

      {/* Multi-Dimensional Risk Categories Cards (Section 32) */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.25rem' }}>
        Passage Threat & Disruption Factors
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {riskCategories.map((rc, idx) => (
          <div 
            key={idx} 
            className="card" 
            style={{ 
              padding: '1.5rem',
              borderTop: `4px solid ${rc.status === 'critical' ? 'var(--semantic-red)' : (rc.status === 'warning' ? 'var(--semantic-amber)' : 'var(--semantic-green)')}`
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>{rc.category}</h3>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                backgroundColor: rc.status === 'critical' ? 'var(--semantic-red-light)' : (rc.status === 'warning' ? 'var(--semantic-amber-light)' : 'var(--semantic-green-light)'),
                color: rc.status === 'critical' ? 'var(--semantic-red)' : (rc.status === 'warning' ? 'var(--semantic-amber)' : 'var(--semantic-green)')
              }}>
                {rc.level} Risk
              </span>
            </div>

            <div style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '0.75rem' }}>
              Affected: <strong>{rc.affectedArea}</strong> • Updated: {rc.lastUpdated}
            </div>

            <div style={{ fontSize: '0.82rem', color: '#334155', marginBottom: '1rem', lineHeight: 1.4 }}>
              <strong>Impact:</strong> {rc.potentialImpact}
            </div>

            <div style={{ fontSize: '0.8rem', color: '#0f172a', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
              <strong>Recommended Action:</strong> {rc.recommendedAction}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
