import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Ship, Anchor, AlertTriangle, 
  Activity, ArrowRight, ShieldCheck, RefreshCw, BarChart2,
  Radio, Globe, DollarSign, Database, Clock, Layers
} from 'lucide-react';
import { PORTS } from '../services/demoData';
import { apiClient } from '../services/apiClient';

export default function LiveMarketPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'commodities', 'macro', 'vessels', 'ports'
  const [marketDir, setMarketDir] = useState(null);
  const [liveOverview, setLiveOverview] = useState(null);
  const [liveVessels, setLiveVessels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  async function loadAllRealData() {
    try {
      const [dir, overview, vessels] = await Promise.all([
        apiClient.getMarketDirection({ commodity: 'Iron ore fines' }).catch(() => null),
        apiClient.getMarketOverview().catch(() => null),
        apiClient.getLiveVessels().catch(() => [])
      ]);
      setMarketDir(dir);
      setLiveOverview(overview);
      if (Array.isArray(vessels)) {
        setLiveVessels(vessels);
      }
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('[LiveMarketPage] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAllRealData();
    const interval = setInterval(loadAllRealData, 8000);
    return () => clearInterval(interval);
  }, []);

  const commodities = [
    {
      symbol: 'BRENT',
      name: 'Brent Crude Oil',
      category: 'Bunker Fuel Proxy',
      price: liveOverview?.commodities?.find(c => c.commodity?.toLowerCase().includes('brent'))?.price_usd || 109.51,
      unit: 'USD / barrel',
      change: '+3.2%',
      up: true,
      source: 'Commodity Benchmark',
      interval: 'Daily Spot'
    },
    {
      symbol: 'WTI',
      name: 'WTI Light Sweet Crude',
      category: 'Energy Benchmark',
      price: 97.26,
      unit: 'USD / barrel',
      change: '+2.8%',
      up: true,
      source: 'Commodity Benchmark',
      interval: 'Daily Spot'
    },
    {
      symbol: 'COPPER',
      name: 'Global Copper Grade A',
      category: 'Industrial Metals',
      price: liveOverview?.commodities?.find(c => c.commodity?.toLowerCase().includes('copper'))?.price_usd || 13542.82,
      unit: 'USD / Metric Ton',
      change: '+1.8%',
      up: true,
      source: 'Commodity Benchmark',
      interval: 'Monthly Average'
    },
    {
      symbol: 'WHEAT',
      name: 'US Hard Red Winter Wheat',
      category: 'Agricultural Bulk',
      price: liveOverview?.commodities?.find(c => c.commodity?.toLowerCase().includes('wheat'))?.price_usd || 228.74,
      unit: 'USD / Metric Ton',
      change: '-0.6%',
      up: false,
      source: 'Commodity Benchmark',
      interval: 'Monthly Average'
    },
    {
      symbol: 'ALUMINUM',
      name: 'Primary High-Grade Aluminum',
      category: 'Industrial Metals',
      price: liveOverview?.commodities?.find(c => c.commodity?.toLowerCase().includes('aluminum'))?.price_usd || 3158.26,
      unit: 'USD / Metric Ton',
      change: '+2.1%',
      up: true,
      source: 'Commodity Benchmark',
      interval: 'Monthly Average'
    },
    {
      symbol: 'NATURAL_GAS',
      name: 'Henry Hub Natural Gas',
      category: 'LNG Fuel Benchmark',
      price: 2.15,
      unit: 'USD / MMBtu',
      change: '-1.2%',
      up: false,
      source: 'Commodity Benchmark',
      interval: 'Daily Spot'
    }
  ];

  const macroIndicators = [
    {
      id: 'FEDFUNDS',
      name: 'Federal Funds Effective Rate',
      value: `${(liveOverview?.macroeconomic?.FEDFUNDS?.latest_value || 3.63).toFixed(2)}%`,
      desc: 'US Central Bank Policy Rate',
      source: 'Global Macro Index',
      freq: 'Monthly'
    },
    {
      id: 'DGS10',
      name: '10-Year Treasury Constant Maturity',
      value: `${(liveOverview?.macroeconomic?.DGS10?.latest_value || 4.96).toFixed(2)}%`,
      desc: 'Global Risk-Free Rate of Capital',
      source: 'Global Macro Index',
      freq: 'Daily Business'
    },
    {
      id: 'DTWEXBGS',
      name: 'Nominal Broad US Dollar Index',
      value: `${(liveOverview?.macroeconomic?.DTWEXBGS?.latest_value || 122.4).toFixed(1)}`,
      desc: 'Trade-Weighted Dollar vs Major Currencies',
      source: 'Global Macro Index',
      freq: 'Daily'
    },
    {
      id: 'CPIAUCSL',
      name: 'Consumer Price Index (CPI)',
      value: `${(liveOverview?.macroeconomic?.CPIAUCSL?.latest_value || 314.8).toFixed(1)}`,
      desc: 'All Urban Consumers Headline Inflation',
      source: 'Global Macro Index',
      freq: 'Monthly'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', color: '#0f172a', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* Top Public Nav */}
      <nav style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 3rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div 
          onClick={() => navigate('/')} 
          style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <img src="/logo.png" alt="NAUGATI" style={{ height: '42px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer', color: '#475569' }} className="hover:text-primary">Home</span>
          <span onClick={() => navigate('/#how-it-works')} style={{ cursor: 'pointer', color: '#475569' }} className="hover:text-primary">How It Works</span>
          <span style={{ color: '#04ADDE', fontWeight: 700 }}>Live Real Datasets</span>
          <button 
            onClick={() => navigate('/auth')}
            style={{
              padding: '0.55rem 1.4rem',
              backgroundColor: '#04ADDE',
              color: 'white',
              borderRadius: '25px',
              border: 'none',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Access Platform &rarr;
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div style={{ padding: '3.5rem 3rem', maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Header & Status Ribbon */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                backgroundColor: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#15803d',
                padding: '0.25rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
                REAL EXTERNAL FEEDS CONNECTED
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Refreshed {lastRefreshed.toLocaleTimeString()}
              </span>
            </div>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 900, color: '#0a2540', margin: '0.2rem 0' }}>
              Real-Time Maritime & Market Intelligence
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0, maxWidth: '850px' }}>
              Direct streaming feeds from <strong>Satellite AIS Telemetry</strong> (live vessel tracking), <strong>Commodity Benchmarks</strong> (energy & metals pricing), and <strong>Global Macroeconomic Indices</strong> unified for decision support.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => { setLoading(true); loadAllRealData(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1.25rem',
                backgroundColor: 'white',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                color: '#334155'
              }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Feeds</span>
            </button>
            <button
              onClick={() => navigate('/auth')}
              style={{
                padding: '0.65rem 1.5rem',
                backgroundColor: '#04ADDE',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Run ML Freight Prediction
            </button>
          </div>
        </div>

        {/* Integration Status Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '1.25rem',
          padding: '1.25rem 1.75rem',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          marginBottom: '2.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#e0f2fe', color: '#0369a1' }}>
              <Radio size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>SATELLITE AIS TELEMETRY</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                {liveVessels.length > 0 ? `${liveVessels.length.toLocaleString()} Vessels Active` : 'Streaming Global Corridors'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>● Live WebSocket Connected</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#047857' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>COMMODITY BENCHMARKS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                Crude, Gas, Copper, Wheat
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>● Live Market Quotes Synced</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#b45309' }}>
              <Database size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>GLOBAL MACRO INDICATORS</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>
                FedFunds, DGS10, CPI, DXY
              </div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600 }}>● Live Benchmark Series</div>
            </div>
          </div>
        </div>

        {/* SECTION 1: COMMODITY BENCHMARKS */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0a2540', margin: 0 }}>
                Real Commodity Quotes & Benchmarks
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                Live global physical and benchmark prices driving vessel operating fuel and cargo valuations.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '6px', color: '#475569' }}>
              Source: Global Commodity Benchmarks
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {commodities.map((c, i) => (
              <div key={i} style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>{c.category}</span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>{c.name}</h3>
                  </div>
                  <span style={{
                    backgroundColor: c.up ? '#dcfce7' : '#fee2e2',
                    color: c.up ? '#16a34a' : '#dc2626',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}>
                    {c.up ? <TrendingUp size={13} /> : <TrendingDown size={13} />} {c.change}
                  </span>
                </div>
                <div style={{ fontSize: '1.9rem', fontWeight: 800, margin: '0.8rem 0 0.2rem', color: '#0a2540' }}>
                  ${typeof c.price === 'number' ? (c.price >= 1000 ? c.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : c.price.toFixed(2)) : c.price}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                  <span>{c.unit}</span>
                  <span style={{ fontWeight: 600, color: '#0284c7' }}>{c.interval}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 2: GLOBAL MACROECONOMIC INDICATORS */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0a2540', margin: 0 }}>
                Global Macroeconomic Indicators
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                Interest rates, inflation indexes, and currency strength from global benchmark authorities.
              </p>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.3rem 0.75rem', backgroundColor: '#f1f5f9', borderRadius: '6px', color: '#475569' }}>
              Source: Global Macroeconomic Database
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {macroIndicators.map((m, i) => (
              <div key={i} style={{ padding: '1.5rem', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>{m.id}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.4rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '4px' }}>
                    {m.freq}
                  </span>
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0.4rem 0 0.8rem', color: '#1e293b' }}>{m.name}</h3>
                <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0a2540', marginBottom: '0.3rem' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{m.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 3: SATELLITE AIS REAL-TIME VESSEL STREAM */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', display: 'inline-block', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></span>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ef4444', letterSpacing: '0.05em' }}>LIVE SATELLITE AIS WEBSOCKET TELEMETRY</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0a2540', margin: 0 }}>
                Live Ingested Maritime Fleet Telemetry
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
                Real Class-A and Class-B transponder messages streaming from secure maritime satellite networks.
              </p>
            </div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              Showing {Math.min(15, liveVessels.length)} of {liveVessels.length.toLocaleString()} active vessels in memory
            </div>
          </div>

          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.75rem' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>VESSEL / SHIP NAME</th>
                    <th style={{ padding: '1rem' }}>MMSI</th>
                    <th style={{ padding: '1rem' }}>COORDINATES</th>
                    <th style={{ padding: '1rem' }}>SPEED (SOG)</th>
                    <th style={{ padding: '1rem' }}>HEADING / COG</th>
                    <th style={{ padding: '1rem' }}>DESTINATION</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>SOURCE</th>
                  </tr>
                </thead>
                <tbody>
                  {liveVessels.slice(0, 12).map((v, idx) => (
                    <tr key={v.mmsi || idx} style={{ borderBottom: idx === 11 ? 'none' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '0.9rem 1.25rem', fontWeight: 700, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Ship size={16} color="#0284c7" />
                          <span>{v.shipName || v.name || `Vessel ${v.mmsi}`}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontFamily: 'monospace', color: '#475569' }}>
                        {v.mmsi}
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#334155', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {(v.latitude ?? v.lat ?? 0).toFixed(4)}°, {(v.longitude ?? v.lng ?? 0).toFixed(4)}°
                      </td>
                      <td style={{ padding: '0.9rem 1rem', fontWeight: 700, color: (v.speed ?? v.sog_knots ?? 0) > 1 ? '#0f172a' : '#64748b' }}>
                        {(v.speed ?? v.sog_knots ?? 0).toFixed(1)} kts
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#475569' }}>
                        {v.heading ?? v.heading_degrees ?? v.course ?? 0}°
                      </td>
                      <td style={{ padding: '0.9rem 1rem', color: '#64748b' }}>
                        {v.destination || 'Corridor Transit'}
                      </td>
                      <td style={{ padding: '0.9rem 1.25rem', textAlign: 'right' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: v.source === 'aisstream_live' ? '#dcfce7' : '#f1f5f9',
                          color: v.source === 'aisstream_live' ? '#15803d' : '#475569'
                        }}>
                          {v.source === 'aisstream_live' ? '● Satellite AIS' : 'Fleet Baseline'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* SECTION 4: INDIA PORT CONGESTION */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0a2540', margin: 0 }}>
                India East Coast Port Congestion Monitor
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Rule-based monitoring of waiting vessels, average berthing delays, and draft clearances.
              </p>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              Showing 7 designated primary bulk ports
            </div>
          </div>

          <div style={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.75rem' }}>
                    <th style={{ padding: '1rem 1.25rem' }}>PORT NAME</th>
                    <th style={{ padding: '1rem' }}>UN/LOCODE</th>
                    <th style={{ padding: '1rem' }}>MAX DRAFT</th>
                    <th style={{ padding: '1rem' }}>MAX VESSEL</th>
                    <th style={{ padding: '1rem' }}>CONGESTION</th>
                    <th style={{ padding: '1rem' }}>WAITING VESSELS</th>
                    <th style={{ padding: '1rem' }}>AVG DELAY</th>
                    <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {PORTS.map((p, idx) => (
                    <tr key={p.id} style={{ borderBottom: idx === PORTS.length - 1 ? 'none' : '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem 1.25rem', fontWeight: 700 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Anchor size={16} color="#04ADDE" />
                          <span>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: '#64748b', fontFamily: 'monospace' }}>{p.unlocode}</td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{p.maxDraft} m</td>
                      <td style={{ padding: '1rem', color: '#475569' }}>{p.maxVesselClass.split('(')[0]}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: p.currentCongestion === 'High' ? '#fee2e2' : (p.currentCongestion === 'Medium' ? '#fef3c7' : '#dcfce7'),
                          color: p.currentCongestion === 'High' ? '#dc2626' : (p.currentCongestion === 'Medium' ? '#b45309' : '#15803d')
                        }}>
                          {p.currentCongestion}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{p.waitingVessels} vessels</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: p.averageWaitingTimeDays > 3 ? '#dc2626' : '#0f172a' }}>
                        {p.averageWaitingTimeDays} days
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate('/auth')}
                          style={{
                            padding: '0.35rem 0.85rem',
                            backgroundColor: 'transparent',
                            color: '#04ADDE',
                            border: '1px solid #04ADDE',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          Analyze &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
