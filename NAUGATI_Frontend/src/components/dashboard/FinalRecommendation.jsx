import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, ShieldAlert, ArrowRight, Anchor, 
  Navigation, Calendar, DollarSign, Award, Sliders, 
  FileText, Activity, AlertTriangle, ExternalLink, Printer 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';

export default function FinalRecommendation() {
  const navigate = useNavigate();
  const { shipment, activePort, activeOrigin, analysisResult, analysisLoading } = useShipment();

  if (analysisLoading || !analysisResult) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
        <Activity size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Synthesizing Multi-Criteria Charter Recommendation...</h2>
        <p style={{ fontSize: '0.85rem' }}>Evaluating draft constraints, freight econometrics, and route safety.</p>
      </div>
    );
  }

  const {
    naugatiOverallScore,
    chosenVessel,
    portCompatibility,
    freight,
    routesData,
    eta,
    risk,
    contract,
    explainableReasons
  } = analysisResult;

  const totalVoyageCostUSD = Math.round(
    (shipment.cargoQuantity * freight.currentFreightUSDPerMT) + 
    routesData.recommendedRoute.estimatedFuelCostUSD +
    (chosenVessel?.deadheadingCostUSD || 0)
  );

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            EXECUTIVE CHARTERING DECISION BRIEF
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Your NAUGATI Recommendation
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Unified decision intelligence integrating freight econometrics, draft engineering, route navigation, and contract risk hedging.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate('/dashboard/what-if')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Sliders size={16} color="var(--primary)" />
            <span>Simulate in What-If</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard/reports')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: '#0f172a',
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
            <Printer size={16} />
            <span>Export Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Shipment Requirement Summary Bar */}
      <div className="card" style={{ padding: '1.25rem 1.75rem', marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.25rem', backgroundColor: '#f8fafc' }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>CARGO REQUIREMENT</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{shipment.cargoQuantity.toLocaleString()} MT {shipment.cargoType}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>VOYAGE PASSAGE</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{activeOrigin.name} &rarr; {activePort.name}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>TARGET LAYCAN</div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>{shipment.preferredLoadingDate} &rarr; {shipment.requiredDeliveryDate}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>PRIORITY</div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', backgroundColor: 'var(--primary-light)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            {shipment.cargoPriority}
          </span>
        </div>
      </div>

      {/* MASTER RECOMMENDATION HERO CARD */}
      <div style={{
        backgroundColor: '#0f172a',
        color: 'white',
        borderRadius: '12px',
        padding: '2.5rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.4)'
      }}>
        {/* Subtle decorative glow */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', backgroundColor: 'rgba(4, 173, 222, 0.15)', filter: 'blur(60px)' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 2 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span style={{
                backgroundColor: 'rgba(4, 173, 222, 0.2)',
                border: '1px solid var(--primary)',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '16px'
              }}>
                RECOMMENDED CHARTERING STRATEGY
              </span>
              <span style={{
                backgroundColor: freight.marketAction === 'BOOK NOW' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: freight.marketAction === 'BOOK NOW' ? '#34d399' : '#fbbf24',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.65rem',
                borderRadius: '16px'
              }}>
                ACTION: {freight.marketAction}
              </span>
            </div>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 1rem 0', lineHeight: 1.3, maxWidth: '850px' }}>
              Fix <span style={{ color: 'var(--primary)' }}>{chosenVessel?.name}</span> ({chosenVessel?.type}) via <span style={{ color: '#38bdf8' }}>{routesData.recommendedRoute.title.split(':')[0]}</span> under a <span style={{ color: '#38bdf8' }}>{contract.recommendedContract.type}</span>.
            </h2>

            <p style={{ fontSize: '0.95rem', color: '#94a3b8', maxWidth: '800px', lineHeight: 1.6, margin: 0 }}>
              {explainableReasons[0]} {explainableReasons[1]}
            </p>
          </div>

          {/* NAUGATI Decision Score Badge */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            minWidth: '160px'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.05em' }}>NAUGATI SCORE</div>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1.1, margin: '0.3rem 0' }}>
              {naugatiOverallScore}
              <span style={{ fontSize: '1.2rem', color: '#64748b' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>High Confidence</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem', position: 'relative', zIndex: 2, flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/dashboard/route-optimization')}
            style={{
              padding: '0.85rem 2rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Inspect Geodesic Route Map</span>
            <ArrowRight size={18} />
          </button>

          <button 
            onClick={() => navigate(`/dashboard/vessel/${chosenVessel?.id}`)}
            style={{
              padding: '0.85rem 1.75rem',
              backgroundColor: 'transparent',
              color: 'white',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer'
            }}
          >
            View Full Vessel Telematics
          </button>
        </div>
      </div>

      {/* 4 Primary Operational Pillar Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        {/* Vessel Match Card */}
        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>RECOMMENDED TONNAGE</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)' }}>Score: {chosenVessel?.matchScore}/100</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.3rem 0 0.2rem' }}>{chosenVessel?.name}</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            {chosenVessel?.type} • {chosenVessel?.dwt.toLocaleString()} DWT • Draft: {chosenVessel?.draft}m
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            Ballast deadheading: <strong>{chosenVessel?.deadheadingDistanceNM} NM</strong> (${chosenVessel?.deadheadingCostUSD.toLocaleString()})
          </div>
        </div>

        {/* Freight Intelligence Card */}
        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--semantic-green)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>FREIGHT FORECAST</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--semantic-green)' }}>{freight.marketAction}</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.3rem 0 0.2rem', color: '#0f172a' }}>
            ${freight.currentFreightUSDPerMT.toFixed(2)} <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ MT</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            7D: ${freight.forecast7D} • 14D: ${freight.forecast14D} (+5.5%)
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            Prediction range: ${freight.predictionRange.min} &ndash; ${freight.predictionRange.max}/MT
          </div>
        </div>

        {/* Port Compatibility Card */}
        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid #0f172a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>DISCHARGE PORT VIABILITY</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--semantic-green)' }}>{portCompatibility.verdict}</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.3rem 0 0.2rem' }}>{activePort.name}</h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            Max Permissible Draft: {activePort.maxDraft}m • Berth LOA: {activePort.maxLOA}m
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            Average queue: <strong>{activePort.averageWaitingTimeDays} days</strong> ({activePort.currentCongestion} Congestion)
          </div>
        </div>

        {/* Route & ETA Card */}
        <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>ROUTE & PASSAGE</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1' }}>{routesData.recommendedRoute.voyageDays} Days</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0.3rem 0 0.2rem' }}>
            {routesData.recommendedRoute.title.split(':')[0]}
          </h3>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' }}>
            Distance: {routesData.recommendedRoute.distanceNM.toLocaleString()} NM • Risk: {routesData.recommendedRoute.overallRisk}
          </div>
          <div style={{ fontSize: '0.78rem', color: '#475569', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
            Estimated Arrival: <strong>{eta.estimatedOceanArrival}</strong> (Delay Prob: {eta.delayProbability})
          </div>
        </div>

      </div>

      {/* Deep Explainable AI Section */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <Award size={22} color="var(--primary)" />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0 }}>
            Why This Recommendation? (Explainable Decision Architecture)
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {explainableReasons.map((reason, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
              <CheckCircle size={18} color="var(--semantic-green)" style={{ marginTop: '2px', flexShrink: 0 }} />
              <div style={{ fontSize: '0.875rem', color: '#334155', lineHeight: 1.5 }}>
                {reason}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary Breakdown Card */}
      <div className="card" style={{ padding: '1.75rem', backgroundColor: '#f8fafc', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 0.25rem 0' }}>
              Estimated Total Voyage Outlay
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
              Including ocean freight, bunker fuel consumption, and ballast repositioning cost.
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
              ${totalVoyageCostUSD.toLocaleString()} <span style={{ fontSize: '1rem', color: '#64748b' }}>USD</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--semantic-green)', fontWeight: 700 }}>
              Hedges against estimated +$130,000 spot rate increase
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
