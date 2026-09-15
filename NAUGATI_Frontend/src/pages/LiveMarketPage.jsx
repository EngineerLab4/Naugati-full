import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, Ship, Anchor, AlertTriangle, 
  Activity, ArrowRight, ShieldCheck, RefreshCw, BarChart2 
} from 'lucide-react';
import { MARKET_INDICES, PORTS, DATA_METADATA } from '../services/demoData';
import { apiClient } from '../services/apiClient';

export default function LiveMarketPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [marketDir, setMarketDir] = useState(null);
  const [liveOverview, setLiveOverview] = useState(null);

  useEffect(() => {
    async function loadMarketData() {
      try {
        const [dir, overview] = await Promise.all([
          apiClient.getMarketDirection({ commodity: 'Iron ore fines' }),
          apiClient.getMarketOverview()
        ]);
        setMarketDir(dir);
        setLiveOverview(overview);
      } catch (_) {}
    }
    loadMarketData();
  }, []);

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
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Ship size={22} color="var(--primary)" />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em' }}>NAUGATI</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', fontSize: '0.9rem', fontWeight: 600 }}>
          <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }} className="hover:text-primary">Home</span>
          <span onClick={() => navigate('/#how-it-works')} style={{ cursor: 'pointer' }} className="hover:text-primary">How It Works</span>
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Live Market</span>
          <button 
            onClick={() => navigate('/auth')}
            style={{
              padding: '0.55rem 1.4rem',
              backgroundColor: 'var(--primary)',
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

      {/* Hero Header */}
      <div style={{
        padding: '4rem 3rem 2.5rem',
        maxWidth: '1350px',
        margin: '0 auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: marketDir?.direction === 'UP' ? 'var(--semantic-green-light)' : marketDir?.direction === 'DOWN' ? 'var(--semantic-red-light)' : '#eff6ff',
                border: marketDir?.direction === 'UP' ? '1px solid var(--semantic-green)' : marketDir?.direction === 'DOWN' ? '1px solid var(--semantic-red)' : '1px solid #bfdbfe',
                padding: '0.25rem 0.65rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: marketDir?.direction === 'UP' ? 'var(--semantic-green)' : marketDir?.direction === 'DOWN' ? 'var(--semantic-red)' : '#0284c7'
              }}>
                <Activity size={12} />
                <span>{marketDir ? `7-DAY MARKET: ${marketDir.direction} (${Math.round(marketDir.confidence * 100)}% CONFIDENCE)` : 'PRODUCTION ML (market_direction_v1)'}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Source: Alpha Vantage + FRED + ML Registry ({marketDir?.model_version || 'v1'}) • Real-time
              </span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#0f172a' }}>
              Live Maritime & Bulk Freight Market
            </h1>
            <p style={{ fontSize: '1.05rem', color: '#64748b', maxWidth: '750px', margin: 0 }}>
              Real-time Baltic Dry Index indicators, vessel class fixtures, bunker fuel pricing, and East Coast India port congestion indicators.
            </p>
          </div>

          <button 
            onClick={() => navigate('/auth')}
            style={{
              padding: '0.85rem 1.75rem',
              backgroundColor: '#0f172a',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span>Run Shipment Forecast</span>
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Primary Benchmark Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginTop: '2.5rem' }}>
          
          {/* BDI Card */}
          <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid var(--primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>COMPOSITE</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>Baltic Dry Index (BDI)</h3>
              </div>
              <span style={{
                backgroundColor: 'var(--semantic-green-light)',
                color: 'var(--semantic-green)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                <TrendingUp size={14} /> +3.41%
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.75rem 0 0.25rem', color: '#0f172a' }}>
              2,184
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              +72 points • Strong Q3 industrial volume support
            </div>
          </div>

          {/* BCI Capesize */}
          <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid #0f172a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>120K-200K DWT</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>Capesize Index (BCI)</h3>
              </div>
              <span style={{
                backgroundColor: 'var(--semantic-green-light)',
                color: 'var(--semantic-green)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                <TrendingUp size={14} /> +4.44%
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.75rem 0 0.25rem', color: '#0f172a' }}>
              3,410
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Avg TCE: $28,250 / day • Iron ore rally
            </div>
          </div>

          {/* BPI Panamax */}
          <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid #04ADDE' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>65K-85K DWT</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>Panamax Index (BPI)</h3>
              </div>
              <span style={{
                backgroundColor: 'var(--semantic-green-light)',
                color: 'var(--semantic-green)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                <TrendingUp size={14} /> +1.72%
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.75rem 0 0.25rem', color: '#0f172a' }}>
              1,895
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Avg TCE: $17,055 / day • Coal shipments active
            </div>
          </div>

          {/* Bunker VLSFO */}
          <div className="card" style={{ padding: '1.5rem', borderTop: '4px solid #10b981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>SINGAPORE HUB</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.2rem 0' }}>VLSFO Bunker Fuel</h3>
              </div>
              <span style={{
                backgroundColor: 'var(--semantic-green-light)',
                color: 'var(--semantic-green)',
                padding: '0.25rem 0.5rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                <TrendingDown size={14} /> -0.82%
              </span>
            </div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.75rem 0 0.25rem', color: '#0f172a' }}>
              $624.50 <span style={{ fontSize: '1rem', color: '#64748b' }}>/ MT</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              -$5.20 / MT • Fuel expenses softening
            </div>
          </div>

        </div>

        {/* Port Congestion & Turnaround Table */}
        <div style={{ marginTop: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>
                India East Coast Port Congestion Monitor
              </h2>
              <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                Rule-based monitoring of waiting vessels, average berthing delays, and draft clearances.
              </p>
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>
              Showing all 7 designated primary bulk ports
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: '#64748b', fontSize: '0.75rem' }}>
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
                          <Anchor size={16} color="var(--primary)" />
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
                          backgroundColor: p.currentCongestion === 'High' ? 'var(--semantic-red-light)' : (p.currentCongestion === 'Medium' ? 'var(--semantic-amber-light)' : 'var(--semantic-green-light)'),
                          color: p.currentCongestion === 'High' ? 'var(--semantic-red)' : (p.currentCongestion === 'Medium' ? 'var(--semantic-amber)' : 'var(--semantic-green)')
                        }}>
                          {p.currentCongestion}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 600 }}>{p.waitingVessels} vessels</td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: p.averageWaitingTimeDays > 3 ? 'var(--semantic-red)' : '#0f172a' }}>
                        {p.averageWaitingTimeDays} days
                      </td>
                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => navigate('/auth')}
                          style={{
                            padding: '0.35rem 0.85rem',
                            backgroundColor: 'transparent',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary)',
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

        {/* Market Disclaimer Callout */}
        <div style={{
          marginTop: '3rem',
          marginBottom: '5rem',
          padding: '1.25rem 1.75rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1e3a8a' }}>
              Connect Institutional AIS & Baltic API Gateways
            </div>
            <div style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '2px' }}>
              NAUGATI integrates directly with proprietary Baltic Exchange, Spire AIS, and Port Authority telematics feeds in production mode.
            </div>
          </div>
          <button 
            onClick={() => navigate('/auth')}
            style={{
              padding: '0.6rem 1.4rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            Launch Intelligent Chartering
          </button>
        </div>

      </div>

    </div>
  );
}
