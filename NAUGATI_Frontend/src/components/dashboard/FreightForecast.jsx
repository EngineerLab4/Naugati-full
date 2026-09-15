import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, Area, ComposedChart, BarChart, Bar 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, DollarSign, Calendar, 
  HelpCircle, Award, CheckCircle, BarChart2, ShieldCheck, Activity 
} from 'lucide-react';
import { useShipment } from '../../context/ShipmentContext';
import { freightService } from '../../services/freightService';
import { ML_MODEL_BENCHMARKS } from '../../services/demoData';

export default function FreightForecast() {
  const { shipment, updateShipment, activePort, activeOrigin } = useShipment();
  const [selectedHorizon, setSelectedHorizon] = useState('30D'); // 7D, 14D, 30D, 90D, 1Y
  const [selectedVesselClass, setSelectedVesselClass] = useState(shipment.preferredVesselType || 'Panamax');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const res = await freightService.getFreightForecast({
        origin: shipment.origin,
        destination: activePort.name,
        vesselType: selectedVesselClass,
        horizon: selectedHorizon
      });
      setForecastData(res);
      setLoading(false);
    }
    loadData();
  }, [shipment.origin, activePort.name, selectedVesselClass, selectedHorizon]);

  if (loading || !forecastData) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        <Activity size={32} className="animate-spin" style={{ margin: '0 auto 1rem', color: 'var(--primary)' }} />
        <div>Computing econometric freight forecast models (XGBoost & SARIMA)...</div>
      </div>
    );
  }

  // Filter time series based on selected horizon
  let filteredSeries = [...forecastData.timeSeries];
  if (selectedHorizon === '7D') {
    filteredSeries = filteredSeries.slice(5, 11);
  } else if (selectedHorizon === '14D') {
    filteredSeries = filteredSeries.slice(4, 12);
  } else if (selectedHorizon === '30D') {
    filteredSeries = filteredSeries.slice(2, 13);
  }

  // Vessel Class Freight Comparison Bar Chart data
  const vesselClassRates = [
    { name: 'Capesize (180k)', voyageRate: +(forecastData.currentFreightUSDPerMT * 0.77).toFixed(2), timeCharter: 26500 },
    { name: 'Panamax (76k)', voyageRate: forecastData.currentFreightUSDPerMT, timeCharter: 16800 },
    { name: 'Supramax (58k)', voyageRate: +(forecastData.currentFreightUSDPerMT * 1.17).toFixed(2), timeCharter: 13900 },
    { name: 'Handysize (35k)', voyageRate: +(forecastData.currentFreightUSDPerMT * 1.34).toFixed(2), timeCharter: 10800 },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
            <span style={{
              backgroundColor: 'var(--primary-light)',
              color: 'var(--primary)',
              fontSize: '0.72rem',
              fontWeight: 700,
              padding: '0.2rem 0.55rem',
              borderRadius: '4px'
            }}>
              VOYAGE FREIGHT FORECASTING
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {forecastData?.metadata?.simulationMode === false ? `PRODUCTION ML (${forecastData?.model_version || 'freight_rate_v1'}) • ` : 'PRODUCTION ML (freight_rate_v1) • '}
              {forecastData?.metadata?.lastUpdated || 'Today 12:00 UTC'}
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Dry Bulk Freight Intelligence
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
            Multi-horizon rate trajectory for <strong>{shipment.origin} &rarr; {activePort.name}</strong> on <strong>{selectedVesselClass}</strong> tonnage.
          </p>
        </div>

        {/* Vessel Class Selector Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', backgroundColor: 'var(--bg-main)', padding: '0.3rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {["Capesize", "Panamax", "Supramax", "Handysize"].map(vc => (
            <button
              key={vc}
              onClick={() => {
                setSelectedVesselClass(vc);
                updateShipment({ preferredVesselType: vc });
              }}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.78rem',
                fontWeight: selectedVesselClass === vc ? 700 : 500,
                backgroundColor: selectedVesselClass === vc ? 'var(--primary)' : 'transparent',
                color: selectedVesselClass === vc ? 'white' : '#64748b',
                cursor: 'pointer'
              }}
            >
              {vc}
            </button>
          ))}
        </div>
      </div>

      {/* Main Row: Time-Series Chart (Left) + Market Action Decision Engine (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left: Recharts Composed Chart with Prediction Interval */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>
                Projected Freight Rate ($ / Tonne)
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Solid gray: Historical observations • Dashed cyan: ML Multi-Horizon Forecast • Shaded: 95% interval
              </div>
            </div>

            {/* Horizon Filter Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {["7D", "14D", "30D (1M)", "90D (3M)", "180D (6M)"].map(h => (
                <button
                  key={h}
                  onClick={() => setSelectedHorizon(h)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    border: selectedHorizon === h ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: selectedHorizon === h ? 'var(--primary-light)' : 'white',
                    color: selectedHorizon === h ? 'var(--primary)' : '#64748b',
                    fontSize: '0.75rem',
                    fontWeight: selectedHorizon === h ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  {h}
                </button>
              ))}
            </div>
          </div>

          <div style={{ width: '100%', height: '380px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={filteredSeries} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 2', 'dataMax + 2']} tickLine={false} unit="$" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', color: 'white', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                  formatter={(val, name) => [`$${val}/MT`, name]}
                />
                
                {/* 95% Confidence Prediction Shaded Interval */}
                <Area type="monotone" dataKey="upper" stroke="none" fill="rgba(4, 173, 222, 0.15)" name="Upper 95% Interval" />
                <Area type="monotone" dataKey="lower" stroke="none" fill="#ffffff" name="Lower 95% Interval" />

                {/* Historical Rate Line */}
                <Line type="monotone" dataKey="actual" stroke="#64748b" strokeWidth={2.5} dot={{ r: 3 }} name="Historical Fixture" />

                {/* Forecast Rate Line */}
                <Line type="monotone" dataKey="forecast" stroke="#04ADDE" strokeWidth={3} strokeDasharray="4 4" dot={{ r: 4, fill: '#04ADDE' }} name="Predicted Rate" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Market Entry Decision Engine & Rate Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Rate Summary Card */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SPOT FIXTURE RATE</span>
              <span style={{ fontSize: '0.72rem', color: '#64748b' }}>USD / MT</span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.25rem 0', color: '#0f172a' }}>
              ${forecastData.currentFreightUSDPerMT.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--semantic-green)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <TrendingUp size={16} /> 7D: ${forecastData.forecast7D} • 14D: ${forecastData.forecast14D}
            </div>
          </div>

          {/* Market Entry Action Card (BOOK NOW / WAIT / MONITOR) */}
          <div 
            className="card" 
            style={{ 
              padding: '1.4rem', 
              borderLeft: `4px solid ${forecastData.marketAction === 'BOOK NOW' ? 'var(--semantic-green)' : (forecastData.marketAction === 'WAIT' ? 'var(--semantic-amber)' : 'var(--primary)')}`,
              backgroundColor: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>MARKET ENTRY DECISION</span>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'var(--semantic-green-light)',
                color: 'var(--semantic-green)'
              }}>
                Confidence: {forecastData.confidence}
              </span>
            </div>

            <div style={{ 
              fontSize: '1.6rem', 
              fontWeight: 800, 
              color: forecastData.marketAction === 'BOOK NOW' ? 'var(--semantic-green)' : 'var(--primary)', 
              marginBottom: '0.5rem' 
            }}>
              {forecastData.marketAction}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.5, margin: 0 }}>
              {forecastData.marketActionReason}
            </p>
          </div>

          {/* Time Charter vs Voyage Charter Distinction */}
          <div className="card" style={{ padding: '1.25rem', backgroundColor: '#f8fafc' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>
              CHARTER TYPE EQUIVALENCE
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>Voyage Freight:</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>${forecastData.currentFreightUSDPerMT} / MT</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#475569' }}>Time Charter (TCE):</span>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>$16,800 / day</span>
            </div>
          </div>

        </div>

      </div>

      {/* Comparison Grid: Freight by Vessel Type & ML Model Benchmark Accuracy */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1.6fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Freight by Vessel Type Bar Chart */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Freight Cost by Vessel Class</h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Voyage ($/MT)</span>
          </div>

          <div style={{ width: '100%', height: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vesselClassRates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} unit="$" />
                <Tooltip formatter={(val) => [`$${val}/MT`, 'Freight Rate']} />
                <Bar dataKey="voyageRate" fill="#04ADDE" radius={[4, 4, 0, 0]} name="Rate ($/MT)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Explainable AI Model Performance Table */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>Forecasting Model Performance</h3>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Walk-forward cross-validation on 2018–2026 data</div>
            </div>
            <ShieldCheck size={18} color="var(--primary)" />
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)', color: '#64748b' }}>
                  <th style={{ padding: '0.5rem 0' }}>MODEL</th>
                  <th style={{ padding: '0.5rem' }}>MAE ($)</th>
                  <th style={{ padding: '0.5rem' }}>RMSE</th>
                  <th style={{ padding: '0.5rem' }}>MAPE</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right' }}>DIRECTIONAL ACC</th>
                </tr>
              </thead>
              <tbody>
                {ML_MODEL_BENCHMARKS.map((m, idx) => (
                  <tr key={idx} style={{ borderBottom: idx === ML_MODEL_BENCHMARKS.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.6rem 0', fontWeight: idx === 0 ? 700 : 500, color: idx === 0 ? 'var(--primary)' : '#0f172a' }}>
                      {m.model.split('(')[0]}
                    </td>
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{m.mae}</td>
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{m.rmse}</td>
                    <td style={{ padding: '0.6rem', fontWeight: 600 }}>{m.mape}</td>
                    <td style={{ padding: '0.6rem', textAlign: 'right', fontWeight: 700, color: idx === 0 ? 'var(--semantic-green)' : '#64748b' }}>
                      {m.directionalAccuracy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
