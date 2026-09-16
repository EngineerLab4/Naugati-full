import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Clock, TrendingDown, RefreshCcw, CheckCircle, 
  Award, FileText, ArrowRight, DollarSign, Sliders 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { contractService } from '../../services/contractService';
import LockedGate from './LockedGate';

export default function ContractRecommendation() {
  const navigate = useNavigate();
  const { shipment, activePort, activeOrigin, analysisResult, hasExecuted } = useShipment();
  const [contractData, setContractData] = useState(null);

  // useEffect must be before any conditional return
  useEffect(() => {
    if (!hasExecuted || !analysisResult) return; // guard inside effect
    async function load() {
      const res = await contractService.recommendContract({
        cargoQuantity: shipment.cargoQuantity,
        frequency: "Monthly",
        marketTrend: "Rising (+5.5%)",
        riskPreference: shipment.cargoPriority,
        baseFreightRate: analysisResult?.freight?.currentFreightUSDPerMT || 24.07
      });
      setContractData(res);
    }
    load();
  }, [shipment.cargoQuantity, shipment.cargoPriority, analysisResult?.freight?.currentFreightUSDPerMT, hasExecuted, analysisResult]);

  // Lock gate — after all hooks
  if (!hasExecuted || !analysisResult) {
    return <LockedGate pageName="Contract Strategy" />;
  }

  if (!contractData) {
    return <div style={{ padding: '3rem', textAlign: 'center' }}>Analyzing contract hedging models...</div>;
  }

  const { contracts, recommendedContract, strategyReason } = contractData;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            CHARTER CONTRACT STRATEGY OPTIMIZATION
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Charter Contract Recommendation
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Compare Spot, Short-Term, Medium-Term, and Long-Term COA commitments for <strong>{shipment.cargoQuantity.toLocaleString()} MT</strong> on <strong>{activeOrigin.name} &rarr; {activePort.name}</strong>.
          </p>
        </div>

        <button 
          onClick={() => navigate('/dashboard/final-recommendation')}
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
          <span>View Master Recommendation</span>
          <ArrowRight size={16} />
        </button>
      </div>

      {/* Contract Comparison Table */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem' }}>
          Contract Structure Matrix & Decision Scoring
        </h2>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', color: '#64748b', fontSize: '0.75rem' }}>
              <th style={{ padding: '0.9rem 1rem' }}>CONTRACT TYPE</th>
              <th style={{ padding: '0.9rem 1rem' }}>INDICATIVE COST</th>
              <th style={{ padding: '0.9rem 1rem' }}>FLEXIBILITY</th>
              <th style={{ padding: '0.9rem 1rem' }}>MARKET RISK</th>
              <th style={{ padding: '0.9rem 1rem' }}>TONNAGE AVAILABILITY</th>
              <th style={{ padding: '0.9rem 1rem' }}>STABILITY</th>
              <th style={{ padding: '0.9rem 1rem', textAlign: 'right' }}>SCORE</th>
            </tr>
          </thead>
          <tbody>
            {contracts.map((c, idx) => (
              <tr 
                key={idx} 
                style={{ 
                  borderBottom: idx === contracts.length - 1 ? 'none' : '1px solid #f1f5f9',
                  backgroundColor: c.recommended ? 'var(--primary-light)' : 'transparent'
                }}
              >
                <td style={{ padding: '1.1rem 1rem', fontWeight: 700, color: c.recommended ? 'var(--primary)' : '#0f172a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {c.recommended && <Award size={18} color="var(--primary)" />}
                    <span>{c.type}</span>
                  </div>
                  {c.recommended && (
                    <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Recommended Strategy
                    </span>
                  )}
                </td>
                <td style={{ padding: '1.1rem 1rem', fontWeight: 700 }}>{c.cost}</td>
                <td style={{ padding: '1.1rem 1rem', color: c.flexibility === 'High' ? 'var(--semantic-green)' : '#64748b', fontWeight: 600 }}>
                  {c.flexibility}
                </td>
                <td style={{ padding: '1.1rem 1rem', color: c.risk.includes('High') ? 'var(--semantic-red)' : 'var(--semantic-green)', fontWeight: 600 }}>
                  {c.risk}
                </td>
                <td style={{ padding: '1.1rem 1rem', color: '#475569' }}>{c.availability}</td>
                <td style={{ padding: '1.1rem 1rem', color: '#475569', fontWeight: 600 }}>{c.stability}</td>
                <td style={{ padding: '1.1rem 1rem', textAlign: 'right' }}>
                  <span style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    backgroundColor: c.recommended ? 'var(--primary)' : '#f1f5f9',
                    color: c.recommended ? 'white' : '#64748b'
                  }}>
                    {c.score}/100
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Strategic Synthesis Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Recommendation Badge Card */}
        <div className="card" style={{ padding: '2rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            OPTIMAL CHARTER STRATEGY
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#0f172a', margin: '0.5rem 0 1rem' }}>
            {recommendedContract.type}
          </div>
          <p style={{ fontSize: '0.85rem', color: '#334155', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            {recommendedContract.bestFor}
          </p>
          <button 
            onClick={() => navigate('/dashboard/final-recommendation')}
            style={{
              padding: '0.75rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            Apply to Voyage Recommendation
          </button>
        </div>

        {/* Explainable AI Strategy Reasoning */}
        <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.75rem' }}>
            Strategic Decision Rationalization
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: '0 0 1.25rem' }}>
            {strategyReason}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <TrendingDown size={18} color="var(--semantic-green)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Hedges Spot Volatility</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avoids expected +5.5% spot freight runup next week.</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
              <Shield size={18} color="var(--semantic-green)" style={{ marginTop: '2px' }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Preserves Flexibility</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Avoids locking in multi-year commitments prematurely.</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
