import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ship, Filter, Search, MapPin, Gauge, Fuel, 
  Calendar, CheckCircle, AlertCircle, ArrowRight, ExternalLink,
  Radio, RefreshCw, Compass
} from 'lucide-react';
import { FLEET_VESSELS } from '../../services/demoData';
import { apiClient } from '../../services/apiClient';

export default function FleetPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('commercial'); // 'commercial' | 'live_ais'
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveAisVessels, setLiveAisVessels] = useState([]);
  const [loadingAis, setLoadingAis] = useState(false);

  async function loadLiveAis() {
    setLoadingAis(true);
    try {
      const raw = await apiClient.getLiveVessels();
      if (Array.isArray(raw)) {
        setLiveAisVessels(raw);
      }
    } catch (e) {
      console.warn('[FleetPage] Could not load live AIS:', e);
    } finally {
      setLoadingAis(false);
    }
  }

  useEffect(() => {
    loadLiveAis();
    const interval = setInterval(loadLiveAis, 12000);
    return () => clearInterval(interval);
  }, []);

  const filteredCommercial = FLEET_VESSELS.filter(v => {
    const matchType = filterType === 'All' || v.type === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchSearch = searchQuery === '' || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.imo.includes(searchQuery) ||
      v.currentVoyage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  const filteredAis = liveAisVessels.filter(v => {
    const name = v.shipName || v.name || '';
    const mmsi = String(v.mmsi || '');
    return searchQuery === '' || 
      name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      mmsi.includes(searchQuery);
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
              FLEET INTELLIGENCE • LIVE SATELLITE AIS
            </span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.3rem',
              backgroundColor: '#dcfce7',
              color: '#15803d',
              padding: '0.15rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 700
            }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
              Satellite AIS Connected
            </span>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Commercial & Live AIS Fleet Telemetry
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Real-time coordinates, speed over ground, heading, and laycan status from live satellite AIS transponder feeds.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadLiveAis}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.65rem 1rem',
              backgroundColor: 'white',
              border: '1.5px solid #cbd5e1',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
              color: '#334155'
            }}
          >
            <RefreshCw size={15} className={loadingAis ? 'animate-spin' : ''} />
            <span>Sync Live AIS</span>
          </button>
          <button 
            onClick={() => navigate('/dashboard/vessel-availability')}
            style={{
              padding: '0.65rem 1.25rem',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Calendar size={16} />
            <span>Update Laycan Dates</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('commercial')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'commercial' ? '3px solid var(--primary)' : '3px solid transparent',
            color: activeTab === 'commercial' ? 'var(--primary)' : '#64748b',
            fontWeight: activeTab === 'commercial' ? 800 : 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Ship size={18} />
          <span>Chartering Fleet ({FLEET_VESSELS.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('live_ais')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'live_ais' ? '3px solid #16a34a' : '3px solid transparent',
            color: activeTab === 'live_ais' ? '#16a34a' : '#64748b',
            fontWeight: activeTab === 'live_ais' ? 800 : 600,
            cursor: 'pointer',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Radio size={18} color={activeTab === 'live_ais' ? '#16a34a' : '#64748b'} />
          <span>Live Satellite AIS Transponders ({liveAisVessels.length.toLocaleString()})</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '6px', width: '260px' }}>
            <Search size={16} color="#64748b" />
            <input 
              type="text"
              placeholder={activeTab === 'commercial' ? "Search vessel or IMO..." : "Search live MMSI or ship name..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', fontFamily: 'Poppins' }}
            />
          </div>

          {activeTab === 'commercial' && (
            <>
              {/* Type Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Type:</span>
                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', fontFamily: 'Poppins' }}
                >
                  <option value="All">All Types</option>
                  <option value="Capesize">Capesize</option>
                  <option value="Panamax">Panamax</option>
                  <option value="Supramax">Supramax</option>
                  <option value="Handysize">Handysize</option>
                </select>
              </div>

              {/* Status Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
                <select 
                  value={filterStatus} 
                  onChange={(e) => setFilterStatus(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', fontFamily: 'Poppins' }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Under Voyage">Under Voyage</option>
                  <option value="Loading">Loading</option>
                  <option value="Discharging">Discharging</option>
                </select>
              </div>

              {/* Quick Jump Vessel Select Option */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Select Vessel:</span>
                <select 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.85rem', outline: 'none', fontFamily: 'Poppins', maxWidth: '180px' }}
                >
                  <option value="">All Vessels ({FLEET_VESSELS.length})</option>
                  {FLEET_VESSELS.map(fv => (
                    <option key={fv.id} value={fv.name}>{fv.name} ({fv.type})</option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          {activeTab === 'commercial' ? (
            <span>Showing <strong>{filteredCommercial.length}</strong> of {FLEET_VESSELS.length} Vessels</span>
          ) : (
            <span>Showing <strong>{Math.min(50, filteredAis.length)}</strong> of {liveAisVessels.length.toLocaleString()} Live Ingested Vessels</span>
          )}
        </div>
      </div>

      {/* COMMERCIAL FLEET TAB */}
      {activeTab === 'commercial' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filteredCommercial.map(v => (
            <div key={v.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.2rem' }}>{v.name}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      IMO {v.imo} • Built {v.built} • Flag: {v.flag}
                    </div>
                  </div>
                  <span style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: v.status === 'Available' ? 'var(--semantic-green-light)' : (v.status === 'Under Voyage' ? 'var(--primary-light)' : '#fef3c7'),
                    color: v.status === 'Available' ? 'var(--semantic-green)' : (v.status === 'Under Voyage' ? 'var(--primary)' : '#b45309')
                  }}>
                    {v.status}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.5rem',
                  backgroundColor: '#f8fafc',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>CLASS</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v.type}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>DEADWEIGHT</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v.dwt.toLocaleString()} MT</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#64748b' }}>MAX DRAFT</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{v.draft} m</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', color: '#475569', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>Position: <strong style={{ color: '#0f172a' }}>{v.currentPosition.locationName}</strong></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Gauge size={15} color="#64748b" />
                    <span>Speed / Heading: <strong>{v.speed} kts</strong> • {v.heading}&deg;</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Ship size={15} color="#64748b" />
                    <span>Current Voyage: <strong>{v.currentVoyage}</strong></span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Open Laycan: <strong style={{ color: '#0f172a' }}>{v.availabilityDate || 'Immediate'}</strong>
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button
                    onClick={() => navigate(`/dashboard/vessel/${v.id}`)}
                    style={{
                      padding: '0.4rem 0.75rem',
                      backgroundColor: '#f8fafc',
                      color: '#475569',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Specs
                  </button>
                  <button
                    onClick={() => navigate('/dashboard/route-optimization')}
                    style={{
                      padding: '0.4rem 0.85rem',
                      backgroundColor: 'transparent',
                      color: 'var(--primary)',
                      border: '1px solid var(--primary)',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Track on Map &rarr;
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIVE SATELLITE AIS TRANSPONDERS TAB */}
      {activeTab === 'live_ais' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {filteredAis.slice(0, 30).map((v, idx) => (
            <div key={v.mmsi || idx} className="card" style={{ padding: '1.25rem', backgroundColor: 'white', border: '1.5px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: '0 0 0.2rem', color: '#0f172a' }}>
                    {v.shipName || v.name || `Vessel ${v.mmsi}`}
                  </h3>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: 'monospace' }}>
                    MMSI: {v.mmsi}
                  </div>
                </div>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '12px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  backgroundColor: '#dcfce7',
                  color: '#15803d'
                }}>
                  Live AIS
                </span>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', margin: '0.75rem 0', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Latitude / Longitude:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{(v.latitude ?? v.lat ?? 0).toFixed(4)}°, {(v.longitude ?? v.lng ?? 0).toFixed(4)}°</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Speed Over Ground:</span>
                  <strong>{(v.speed ?? v.sog_knots ?? 0).toFixed(1)} knots</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Course / True Heading:</span>
                  <strong>{v.course ?? v.cog_degrees ?? 0}° / {v.heading ?? v.heading_degrees ?? 0}°</strong>
                </div>
                {v.destination && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Destination:</span>
                    <strong style={{ color: '#0284c7' }}>{v.destination}</strong>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                <span>Source: <strong>Satellite AIS Telemetry</strong></span>
                <button
                  onClick={() => navigate('/dashboard/route-optimization')}
                  style={{
                    padding: '0.3rem 0.65rem',
                    backgroundColor: 'transparent',
                    color: 'var(--primary)',
                    border: '1px solid var(--primary)',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Plot Map &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
