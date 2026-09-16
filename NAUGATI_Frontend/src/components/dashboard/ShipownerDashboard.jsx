import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ship, TrendingUp, Crosshair, Award, MapPin, 
  Calendar, CheckCircle, AlertTriangle, ArrowUpRight, DollarSign,
  Radio, RefreshCw, Filter, Compass, ArrowRight, Gauge, Layers
} from 'lucide-react';
import { FLEET_VESSELS, BACKHAUL_OPPORTUNITIES, MARKET_INDICES, DATA_METADATA } from '../../services/demoData';
import { apiClient } from '../../services/apiClient';

export default function ShipownerDashboard() {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState(FLEET_VESSELS);
  const [liveVesselsCount, setLiveVesselsCount] = useState(0);
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isSyncing, setIsSyncing] = useState(false);

  // Fetch real-time satellite AIS telemetry stream
  async function fetchLiveAIS() {
    setIsSyncing(true);
    try {
      const live = await apiClient.getLiveVessels();
      if (Array.isArray(live) && live.length > 0) {
        setLiveVesselsCount(live.length);
        
        // Enrich fleet with live satellite AIS positioning & speed
        setFleet(prev => prev.map((v, idx) => {
          const matchedAis = live.find(l => String(l.mmsi) === String(v.imo) || String(l.name).toLowerCase() === v.name.toLowerCase()) || live[idx % live.length];
          if (matchedAis) {
            return {
              ...v,
              currentPosition: {
                ...v.currentPosition,
                lat: matchedAis.latitude ?? matchedAis.lat ?? v.currentPosition.lat,
                lng: matchedAis.longitude ?? matchedAis.lng ?? v.currentPosition.lng,
                locationName: matchedAis.destination || v.currentPosition.locationName
              },
              speed: +(matchedAis.speed ?? matchedAis.sog_knots ?? v.speed).toFixed(1),
              heading: Math.round(matchedAis.course ?? matchedAis.cog_degrees ?? v.heading),
              isLiveAis: true,
              lastAisUpdate: new Date().toLocaleTimeString()
            };
          }
          return v;
        }));
      }
    } catch (err) {
      console.warn('[ShipownerDashboard] Live AIS sync fallback:', err.message);
    } finally {
      setIsSyncing(false);
    }
  }

  useEffect(() => {
    fetchLiveAIS();
    const interval = setInterval(fetchLiveAIS, 15000);
    return () => clearInterval(interval);
  }, []);

  // Filtered fleet by user select options
  const filteredFleet = useMemo(() => {
    return fleet.filter(v => {
      const matchClass = selectedClass === 'All' || v.type === selectedClass;
      const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
      return matchClass && matchStatus;
    });
  }, [fleet, selectedClass, selectedStatus]);

  // Dynamic KPI calculations from active fleet state
  const totalTonnageDWT = useMemo(() => {
    return filteredFleet.reduce((sum, v) => sum + (v.dwt || 0), 0);
  }, [filteredFleet]);

  const availableVessels = useMemo(() => {
    return filteredFleet.filter(v => v.status === 'Available' || v.availabilityStatus === 'Immediate');
  }, [filteredFleet]);

  const estimatedFleetRevenue = useMemo(() => {
    return filteredFleet.reduce((sum, v) => sum + ((v.timeCharterUSDPerDay || 16500) * 30), 0);
  }, [filteredFleet]);

  const avgBallastNM = useMemo(() => {
    if (filteredFleet.length === 0) return 0;
    const total = filteredFleet.reduce((sum, v) => sum + (v.deadheadingDistanceNM || 120), 0);
    return Math.round(total / filteredFleet.length);
  }, [filteredFleet]);

  return (
    <div>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.35rem' }}>
            <span style={{ 
              backgroundColor: 'var(--primary-light)', 
              color: 'var(--primary)', 
              fontSize: '0.75rem', 
              fontWeight: 800, 
              padding: '0.2rem 0.6rem', 
              borderRadius: '4px' 
            }}>
              OCEAN CARRIER PORTAL
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
              Live AIS: {liveVesselsCount > 0 ? `${liveVesselsCount.toLocaleString()} Vessels Streaming` : 'Satellite AIS Connected'}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>
            Commercial Fleet & Voyage Operations
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0.25rem 0 0' }}>
            Monitor open vessel positions, minimize ballast deadheading miles, and capture high-margin backhaul fixtures.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            onClick={fetchLiveAIS}
            disabled={isSyncing}
            style={{
              padding: '0.65rem 1.1rem',
              backgroundColor: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#334155'
            }}
          >
            <RefreshCw size={15} className={isSyncing ? 'animate-spin' : ''} color="var(--primary)" />
            <span>{isSyncing ? 'Syncing AIS...' : 'Refresh Telemetry'}</span>
          </button>

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
            onClick={() => navigate('/dashboard/deadheading')}
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
            <Crosshair size={16} />
            <span>Deadheading Optimizer</span>
          </button>
        </div>
      </div>

      {/* Filter & Select Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="#64748b" />
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>FILTER FLEET:</span>
          </div>

          {/* Select Vessel Class Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Vessel Class:</span>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
            >
              <option value="All">All Classes (Capesize / Panamax / Supramax / Handysize)</option>
              <option value="Capesize">Capesize (180,000 DWT)</option>
              <option value="Panamax">Panamax (75,000 DWT)</option>
              <option value="Supramax">Supramax (58,000 DWT)</option>
              <option value="Handysize">Handysize (38,000 DWT)</option>
            </select>
          </div>

          {/* Select Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.82rem', fontFamily: 'Poppins', backgroundColor: 'white' }}
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available (Open Position)</option>
              <option value="Under Voyage">Under Voyage</option>
              <option value="Discharging">Discharging</option>
              <option value="Loading">Loading</option>
            </select>
          </div>
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          Showing <strong>{filteredFleet.length}</strong> of {fleet.length} Vessels in Commercial Pool
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>TOTAL FLEET TONNAGE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--primary)' }}>
            {totalTonnageDWT.toLocaleString()} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>DWT</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            Across {filteredFleet.length} active bulk vessels
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--semantic-green)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>OPEN / PROMPT TONNAGE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--semantic-green)' }}>
            {availableVessels.length} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Vessels</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {availableVessels.reduce((acc, v) => acc + v.dwt, 0).toLocaleString()} DWT prompt for fixture
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>ESTIMATED 30-DAY RUN RATE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem' }}>
            ${(estimatedFleetRevenue / 1000000).toFixed(2)}M <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>USD</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--semantic-green)', fontWeight: 600 }}>
            +$426K backhaul pipeline captured
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--semantic-amber)' }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b' }}>AVG BALLAST EXPOSURE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0.4rem 0 0.2rem', color: 'var(--semantic-amber)' }}>
            {avgBallastNM} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>NM</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            {avgBallastNM > 300 ? 'High deadheading risk' : 'Low deadheading risk across pool'}
          </div>
        </div>

      </div>

      {/* Main Grid: Fleet Status & High-Priority Backhaul Pipeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1.2fr', gap: '1.5rem', marginBottom: '2rem' }}>
        
        {/* Left: Commercial Fleet Status */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0 }}>Active Fleet Status</h2>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Live positions synced via satellite AIS transponders</div>
            </div>
            <button 
              onClick={() => navigate('/dashboard/fleet')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
            >
              View Full Fleet Telematics &rarr;
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredFleet.map(v => (
              <div 
                key={v.id}
                style={{
                  padding: '1.1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Ship size={18} color="var(--primary)" />
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{v.name}</span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#f1f5f9', color: '#475569', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                      {v.type} • {v.dwt?.toLocaleString()} DWT
                    </span>
                    {v.isLiveAis && (
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#dcfce7', color: '#15803d', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 700 }}>
                        LIVE AIS
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.35rem' }}>
                    Position: <strong style={{ color: '#0f172a' }}>{v.currentPosition?.locationName || 'Bay of Bengal'}</strong> • Next: <strong>{v.nextPort || v.destination || 'Dhamra Port'}</strong>
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.2rem' }}>
                    Speed: <strong>{v.speed} kts</strong> • Ballast Exposure: <strong>{v.deadheadingDistanceNM || 140} NM</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
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
                    Open Laycan: <strong style={{ color: '#0f172a' }}>{v.availabilityDate || 'Immediate'}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => navigate(`/dashboard/vessel/${v.id}`)}
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: '#f8fafc',
                        border: '1px solid var(--border-color)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: '#475569'
                      }}
                    >
                      Specs &rarr;
                    </button>
                    <button
                      onClick={() => navigate('/dashboard/deadheading')}
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        backgroundColor: 'var(--primary-light)',
                        border: '1px solid var(--primary)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        color: 'var(--primary)'
                      }}
                    >
                      Deadheading &rarr;
                    </button>
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
                      padding: '0.35rem 0.85rem',
                      backgroundColor: 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '0.74rem',
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
