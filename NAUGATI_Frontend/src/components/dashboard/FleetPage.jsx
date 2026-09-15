import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Ship, Filter, Search, MapPin, Gauge, Fuel, 
  Calendar, CheckCircle, AlertCircle, ArrowRight, ExternalLink 
} from 'lucide-react';
import { FLEET_VESSELS } from '../../services/demoData';

export default function FleetPage() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredVessels = FLEET_VESSELS.filter(v => {
    const matchType = filterType === 'All' || v.type === filterType;
    const matchStatus = filterStatus === 'All' || v.status === filterStatus;
    const matchSearch = searchQuery === '' || 
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.imo.includes(searchQuery) ||
      v.currentVoyage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchStatus && matchSearch;
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
            FLEET MANAGEMENT • OCEAN CARRIER
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0.2rem 0', color: '#0f172a' }}>
            Commercial Vessel Fleet
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
            Live status, dimensional drafts, voyage trajectories, and laycan availability for your dry bulk carrier fleet.
          </p>
        </div>

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
          <span>Update Availability Dates</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '6px', width: '240px' }}>
            <Search size={16} color="#64748b" />
            <input 
              type="text"
              placeholder="Search vessel or IMO..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', fontFamily: 'Poppins' }}
            />
          </div>

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
        </div>

        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>
          Showing <strong>{filteredVessels.length}</strong> of {FLEET_VESSELS.length} Vessels
        </div>
      </div>

      {/* Vessels Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredVessels.map(v => (
          <div key={v.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              {/* Header */}
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

              {/* Specs Grid */}
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

              {/* Current Voyage & Position */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Calendar size={15} color="#64748b" />
                  <span>Next Laycan Open: <strong style={{ color: 'var(--primary)' }}>{v.availabilityDate}</strong></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <button 
                onClick={() => navigate(`/dashboard/vessel/${v.id}`)}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--primary)',
                  color: 'var(--primary)',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Inspect Telematics
              </button>
              <button 
                onClick={() => navigate('/dashboard/deadheading')}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  backgroundColor: '#0f172a',
                  border: 'none',
                  color: 'white',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Ballast Routing
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
