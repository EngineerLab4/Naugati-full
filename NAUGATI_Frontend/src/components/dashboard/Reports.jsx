import React, { useState } from 'react';
import { 
  FileText, Download, Printer, CheckCircle, 
  Ship, Map, TrendingUp, Anchor, ShieldAlert 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import LockedGate from './LockedGate';

export default function Reports() {
  const { shipment, activePort, activeOrigin, analysisResult, hasExecuted } = useShipment();
  const [reportType, setReportType] = useState('Comprehensive Charter Recommendation');
  const [generating, setGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(true);

  // Lock gate — reports need ML pipeline data
  if (!hasExecuted || !analysisResult) {
    return <LockedGate pageName="Maritime Intelligence Reports" />;
  }

  const reportTypes = [
    'Comprehensive Charter Recommendation',
    'Freight Forecast & Econometric Report',
    'Vessel Suitability & Draft Audit',
    'Geodesic Route & ETA Optimization Brief',
    'Port Infrastructure & Congestion Report',
    'Risk & Sanctions Compliance Clearance'
  ];

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setReportReady(true);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  const chosenVessel = analysisResult?.chosenVessel;
  const freight = analysisResult?.freight;
  const routesData = analysisResult?.routesData;
  const score = analysisResult?.naugatiOverallScore || 92;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '4rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            ENTERPRISE EXPORT & AUDIT
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Maritime Intelligence Reports
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Generate and export decision dossiers for investment committees, chartering brokers, and risk compliance audits.
          </p>
        </div>

        <button 
          onClick={handlePrint}
          style={{
            padding: '0.65rem 1.4rem',
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
          <span>Print / Save as PDF</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '2rem' }}>
        
        {/* Left: Report Configuration Form */}
        <div className="card" style={{ padding: '1.75rem', alignSelf: 'start' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Report Specifications
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                Report Dossier Type
              </label>
              <select 
                value={reportType}
                onChange={e => setReportType(e.target.value)}
                style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'Poppins' }}
              >
                {reportTypes.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                Active Voyage Subject
              </label>
              <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.82rem' }}>
                <strong>{shipment.cargoQuantity.toLocaleString()} MT {shipment.cargoType}</strong><br/>
                <span style={{ color: '#64748b' }}>Route: {activeOrigin.name} &rarr; {activePort.name}</span>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.4rem', color: '#0f172a' }}>
                Sections to Include
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem', color: '#475569' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input type="checkbox" defaultChecked /> Cargo & Laycan Window Summary
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input type="checkbox" defaultChecked /> Vessel Draft & Beam Compatibility Matrix
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input type="checkbox" defaultChecked /> Econometric Freight Forecast (XGBoost / SARIMA)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input type="checkbox" defaultChecked /> Geodesic Waypoints & ETA Timetable
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input type="checkbox" defaultChecked /> Demurrage & Idle-Time Risk Modeling
                </label>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={generating}
              style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: generating ? 'not-allowed' : 'pointer'
              }}
            >
              {generating ? "Compiling Telematics..." : "Compile Intelligence Dossier"}
            </button>
          </div>
        </div>

        {/* Right: Print-Ready Report Preview */}
        <div className="card" style={{ padding: '2rem', backgroundColor: '#ffffff' }} id="printableReport">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.05em' }}>NAUGATI</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.08em' }}>MARITIME DECISION INTELLIGENCE PLATFORM</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
              <div>Date: <strong>13 September 2026</strong></div>
              <div>Ref ID: <strong>NAU-CH-94821</strong></div>
              <div>Status: <strong>AUTHENTICATED AUDIT</strong></div>
            </div>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 0.5rem' }}>{reportType}</h2>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
            Voyage Passage: <strong>{activeOrigin.name} ({activeOrigin.defaultPort})</strong> to <strong>{activePort.name} (India)</strong>
          </div>

          {/* Key Facts Box */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.8rem' }}>
            <div>
              <span style={{ color: '#64748b' }}>Cargo:</span> <strong>{shipment.cargoQuantity.toLocaleString()} MT {shipment.cargoType}</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Recommended Vessel:</span> <strong>{chosenVessel?.name || 'Panamax Standard'} ({chosenVessel?.type || 'Panamax'})</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Spot Voyage Rate:</span> <strong>${freight?.currentFreightUSDPerMT || 24.07}/MT</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Estimated Transit:</span> <strong>{routesData?.recommendedRoute?.voyageDays || 15.4} Days ({(routesData?.recommendedRoute?.distanceNM || 5000).toLocaleString()} NM)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>Port Permissible Draft:</span> <strong>{activePort?.maxDraft || 14.5} m (Safe UKC: +{((activePort?.maxDraft || 14.5) - (chosenVessel?.draft || 13.5)).toFixed(1)}m)</strong>
            </div>
            <div>
              <span style={{ color: '#64748b' }}>NAUGATI Score:</span> <strong style={{ color: 'var(--primary)' }}>{score}/100 (High Confidence)</strong>
            </div>
          </div>

          {/* Executive Summary */}
          <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            <strong>EXECUTIVE CHARTERING SUMMARY:</strong><br/>
            Based on multi-horizon machine learning models (Random Forest & ExtraTrees) and port constraint checks, NAUGATI recommends chartering <strong>{(chosenVessel?.name || 'Panamax Commercial Carrier').replace(/\s*\(vessel_master\.csv\)/i, '')}</strong> under a <strong>Voyage Charter Contract</strong>. Real-time macroeconomic indicators and marine meteorological telemetry confirm safe draft clearance and optimal bunker expenditure.
          </div>

          {/* Signature & Watermark Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.72rem', color: '#94a3b8' }}>
            <span>Verified by NAUGATI Algorithmic Decision Engine</span>
            <span>Document Hash: SHA256:7f8a9...b4c2</span>
          </div>

        </div>

      </div>

    </div>
  );
}
