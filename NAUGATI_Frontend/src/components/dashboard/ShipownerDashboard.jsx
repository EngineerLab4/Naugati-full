import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ship, TrendingUp, Crosshair, Award, MapPin, 
  Calendar, CheckCircle, AlertTriangle, ArrowUpRight, DollarSign 
} from 'lucide-react';
import { FLEET_VESSELS, BACKHAUL_OPPORTUNITIES, MARKET_INDICES, DATA_METADATA } from '../../services/demoData';

export default function ShipownerDashboard() {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState(FLEET_VESSELS);

  const availableVessels = fleet.filter(v => v.status === 'Available' || v.availabilityStatus === 'Immediate');
  const upcomingVessels = fleet.filter(v => v.status === 'Under Voyage' || v.status === 'Discharging');

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary)', 
              fontSize: '0.75rem', 
              fontWeight: 700, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '4px' 
            }}>
              OCEAN CARRIER PORTAL
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>DEMO FLEET MONITOR</span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Commercial Fleet & Voyage Operations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Monitor open vessel positions, minimize ballast deadheading miles, and capture high-margin backhaul fixtures.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate('/dashboard/vessel-availability')}
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
            <Calendar size={16} color="var(--primary)" />
            <span>Manage Availability</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard/backhaul')}
            style={{
              padding: '0.65rem 1.25rem',
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
            <Award size={16} />
            <span>View Backhaul Fixtures</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>TOTAL FLEET TONNAGE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem' }}>
            504,700 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>DWT</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>
            6 Vessels active in Bay of Bengal & Indo-Pacific
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--semantic-green)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>OPEN / PROMPT TONNAGE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--semantic-green)' }}>
            {availableVessels.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Vessels</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Immediate spot fixing ready off East Coast India
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>ESTIMATED FLEET REVENUE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem' }}>
            $2.84M <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>USD</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--semantic-green)', fontWeight: 600 }}>
            +$426K backhaul pipeline captured
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--semantic-amber)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b' }}>AVG BALLAST EXPOSURE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--semantic-amber)' }}>
            144 <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>NM</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
            Low deadheading risk across current laycans
          </div>
        </div>

      </div>

      {/* Grid: Fleet Overview & High-Priority Backhaul Opportunities */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left: Commercial Fleet Status */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Active Fleet Status</h2>
            <button 
              onClick={() => navigate('/dashboard/fleet')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              View Full Fleet &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {fleet.map(v => (
              <div 
                key={v.id}
                style={{
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Ship size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {v.type} • {v.dwt.toLocaleString()} DWT
                    </span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Position: <span style={{ color: '#0f172a', fontWeight: 600 }}>{v.currentPosition.locationName}</span> • Next: {v.nextPort}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: v.status === 'Available' ? 'var(--semantic-green-light)' : (v.status === 'Under Voyage' ? 'var(--primary-light)' : '#fef3c7'),
                    color: v.status === 'Available' ? 'var(--semantic-green)' : (v.status === 'Under Voyage' ? 'var(--primary)' : '#b45309')
                  }}>
                    {v.status}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.3rem' }}>
                    Avail: <strong style={{ color: '#0f172a' }}>{v.availabilityDate}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: High-Value Backhaul Fixtures */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Backhaul Cargo Pipeline</h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Cargo available to eliminate empty ballast return</div>
            </div>
            <Award size={20} color="var(--primary)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {BACKHAUL_OPPORTUNITIES.map(opp => (
              <div 
                key={opp.id}
                style={{
                  padding: '1.1rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.04em' }}>
                      {opp.status.toUpperCase()}
                    </span>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0.2rem 0 0.4rem' }}>
                      {opp.cargo} ({opp.quantity})
                    </h3>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--semantic-green)' }}>
                      +${(opp.netMarginUSD / 1000).toFixed(0)}K
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Net Margin</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.78rem', color: '#475569', margin: '0.4rem 0' }}>
                  <strong>Route:</strong> {opp.origin} &rarr; {opp.destination}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #e2e8f0', fontSize: '0.75rem' }}>
                  <span style={{ color: '#64748b' }}>
                    Ballast: <strong>{opp.repositioningDistanceNM} NM</strong> ({opp.ballastTimeHours}h)
                  </span>
                  <button 
                    onClick={() => navigate('/dashboard/backhaul')}
                    style={{
                      padding: '0.3rem 0.75rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      cursor: 'pointer'
                    }}
                  >
                    Lock Fixture &rarr;
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
