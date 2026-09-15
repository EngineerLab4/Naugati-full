import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Award, TrendingUp, DollarSign, ArrowRight, 
  MapPin, Calendar, ShieldCheck, CheckCircle2 
} from 'lucide-react';
import { BACKHAUL_OPPORTUNITIES, FLEET_VESSELS } from '../../services/demoData';

export default function BackhaulOpportunities() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState(BACKHAUL_OPPORTUNITIES);
  const [fixedIds, setFixedIds] = useState([]);

  const handleFixOpportunity = (id) => {
    setFixedIds(prev => [...prev, id]);
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            ALTERNATIVE EMPLOYMENT & BACKHAUL • SHIPOWNER PORTAL
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Backhaul & Triangulation Cargo
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Eliminate non-earning empty ballast legs after discharging overseas cargo on India's East Coast.
          </p>
        </div>

        <div style={{
          padding: '0.65rem 1.25rem',
          backgroundColor: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          color: '#1e40af',
          fontWeight: 700,
          fontSize: '0.85rem'
        }}>
          Simulated Fixture Exchange
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--semantic-green)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL BACKHAUL PIPELINE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.3rem 0 0.1rem', color: 'var(--semantic-green)' }}>
            $2.44M USD
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Across 3 active East Coast India export tenders</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>BALLAST DISTANCE SAVINGS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.3rem 0 0.1rem', color: 'var(--primary)' }}>
            3,480 NM
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Eliminates empty ballast voyages back to loading origins</div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid #0f172a' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>AVERAGE TCE YIELD</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.3rem 0 0.1rem' }}>
            $21,170 <span style={{ fontSize: '0.85rem', color: '#64748b' }}>/ day</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Outperforms standard spot charter returns by +18%</div>
        </div>
      </div>

      {/* Opportunities List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {fixtures.map((opp, i) => {
          const isBooked = fixedIds.includes(opp.id);

          return (
            <div key={opp.id} className="card" style={{ padding: '1.75rem', border: isBooked ? '2px solid var(--semantic-green)' : '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      padding: '0.2rem 0.6rem',
                      borderRadius: '4px',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontSize: '0.75rem',
                      fontWeight: 700
                    }}>
                      {opp.status.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Match Score: <strong style={{ color: 'var(--primary)' }}>{opp.matchScore}/100</strong></span>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.4rem 0 0.2rem' }}>
                    {opp.cargo} • {opp.quantity}
                  </h2>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    <strong>Loading Port:</strong> {opp.origin} &rarr; <strong>Discharge Port:</strong> {opp.destination}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--semantic-green)' }}>
                    +${opp.netMarginUSD.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Estimated Net Voyage Margin (TCE: ${opp.dailyTCEUSD.toLocaleString()}/day)
                  </div>
                </div>
              </div>

              {/* Financial & Operational Breakdown Table */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem',
                backgroundColor: '#f8fafc',
                padding: '1rem 1.25rem',
                borderRadius: '8px',
                marginBottom: '1.25rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>OFFERED FREIGHT</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>${opp.offeredFreightUSDPerMT.toFixed(2)} / MT</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>LAYCAN WINDOW</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{opp.laycan}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>REPOSITIONING BALLAST</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary)' }}>{opp.repositioningDistanceNM} NM ({opp.ballastTimeHours}h)</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>ESTIMATED GROSS REVENUE</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800 }}>${opp.estimatedRevenueUSD.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>OPERATIONAL RISK</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--semantic-green)' }}>{opp.risk}</div>
                </div>
              </div>

              {/* Action Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Recommended candidate tonnage: <strong>MV Ocean Splendor (Panamax)</strong> or <strong>MV Southern Cross</strong>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    onClick={() => navigate('/dashboard/deadheading')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      backgroundColor: 'transparent',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Simulate Ballast Leg
                  </button>

                  <button 
                    onClick={() => handleFixOpportunity(opp.id)}
                    disabled={isBooked}
                    style={{
                      padding: '0.6rem 1.4rem',
                      backgroundColor: isBooked ? 'var(--semantic-green)' : 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: isBooked ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem'
                    }}
                  >
                    {isBooked ? (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Fixture Locked in Demo</span>
                      </>
                    ) : (
                      <>
                        <Award size={16} />
                        <span>Accept Fixture &rarr;</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
